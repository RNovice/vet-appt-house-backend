const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middleware = jsonServer.defaults();

const rules = auth.rewriter({
  vetClinics: 444,
})


server.get('/vetClinics/:id?', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const db = router.db;
  const vetClinics = db.get("vetClinics").value();
  const treatedAnimals = db.get("species").value();
  const services = db.get("services").value();
  const mainImages = db.get("mainImages").value();

  const expandClinic = clinic => ({
    ...clinic,
    treatedAnimals: clinic.treatedAnimals.map(animalId => treatedAnimals.find(a => a.id === animalId)),
    services: clinic.services.map(serviceId => services.find(s => s.id === serviceId)),
    imageUrl: mainImages.find(img => img.id === clinic.imageUrl)?.url || null,
  });

  if (req.params.id) {
    const clinic = vetClinics.find(c => c.id === Number(req.params.id));
    return clinic ? res.json(expandClinic(clinic)) : res.status(404).json({ error: 'Not found' });
  }

  let clinics = vetClinics.map(expandClinic);
  const { city, district, day, time, keyword, req: required, tag, limit, page, status: activity } = req.query;

  if (city) clinics = clinics.filter(c => c.city === city);
  if (district) clinics = clinics.filter(c => c.district === district);

  if (day || time) {
    const dayIndex = day ? (day === "0" ? 6 : +day - 1) : null;
    const timeIndex = { AM: 0, PM: 1, EV: 2 }[time];

    clinics = clinics.filter(c =>
      day && time
        ? c.businessHours[timeIndex]?.[dayIndex]
        : day
          ? c.businessHours.some(times => times[dayIndex])
          : c.businessHours[timeIndex]?.some(Boolean)
    );
  }

  if (keyword) clinics = clinics.filter(c => c.name.includes(keyword));

  if (required) {
    const requiredFields = Array.isArray(required) ? required : [required];
    clinics = clinics.filter(c => requiredFields.every(field => c[field]));
  }

  if (tag) {
    const tagRef = {
      hasExoticPetTreat: "特寵診療",
      hasEmergency: "夜間急診",
      isAllDay: "24HR營業",
      hasWalkInAppt: "現場預約",
      hasCallBooking: "電話預約",
      hasParking: "停車空間",
      // HomeVisit: "到府診療",
      // MCParking: "汽車停車",
      // CarParking: "機車停車",
    }

    clinics = clinics.map(c => ({
      ...c,
      tags: Object.keys(tagRef)
        .filter(key => c[key])
        .map(key => tagRef[key])
    }));
  }

  if (activity) {
    if (activity === "enabled") {
      clinics = clinics.filter(c => c.isEnabled);
    }
    else if (activity === "disabled") {
      clinics = clinics.filter(c => !c.isEnabled);
    }
  }

  const pageNum = page ? parseInt(page) : 1;
  const limitNum = parseInt(limit || 10);
  const total = clinics.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = clinics.slice(startIndex, startIndex + limitNum);

  return res.json({
    data: paginatedData,
    pagination: {
      total,
      current: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: startIndex + limitNum < total,
      hasPrevPage: startIndex > 0,
    },
  });
});

server.use((req, res, next) => {
  if (req.method !== "GET" && req.path.startsWith("/news")) {
    return res.status(403).json({ error: "Read-only access" });
  }
  next();
});

const updateClinicStatus = (req, res, status) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { id } = req.params;
  const clinic = router.db.get("vetClinics").find({ id: Number(id) });

  if (!clinic.value()) {
    return res.status(404).json({ error: "Clinic not found" });
  }

  if (clinic.value().isEnabled !== status) {
    clinic.assign({ isEnabled: status }).write();
  }

  res.json({ clinic: clinic.value() });
};

server.patch("/vetClinics/:id/enable", (req, res) => updateClinicStatus(req, res, true));
server.patch("/vetClinics/:id/disable", (req, res) => updateClinicStatus(req, res, false));

server.get("/clinicAnalyze", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const db = router.db;
  const clinics = db.get("vetClinics").value();
  const cityClinicAmount = clinics.reduce((acc, {city}) => {
    acc[city] = (acc[city] ?? 0) + 1;
    return acc
  }, {})
  res.json({ totalClinic: clinics.length, cityClinicAmount });
})

server.db = router.db;
server.use(middleware);
server.use(auth);
server.use(rules);
server.use(router);

server.listen(3000, () => {
  console.log('listening on port 3000');
});

