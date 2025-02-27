const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middleware = jsonServer.defaults();

// server.use(
//   jsonServer.rewriter({
//     "/vetClinics/all/_expended": "/vetClinics_expended"
//   })
// );

const rules = auth.rewriter({
  vetClinics: 444,
})


server.get('/vetClinics', (req, res) => {
  const db = router.db
  const vetClinics = db.get("vetClinics").value();
  const treatedAnimals = db.get("treatedAnimals").value();
  const services = db.get("services").value();
  const mainImages = db.get("mainImages").value();
  const expended = vetClinics.map((clinic) => ({
    ...clinic,
    treatedAnimals: clinic.treatedAnimals.map(animalId => treatedAnimals.find(animal => animal.id === animalId)),
    services: clinic.services.map(serviceId => services.find(service => service.id === serviceId)),
    imageUrl: mainImages.find(image => clinic.imageUrl === image.id).url,
  }))

  res.json(expended)
});

server.use((req, res, next) => {
  if (req.method !== "GET" && req.path.startsWith("/news")) {
    return res.status(403).json({ error: "Read-only access" });
  }
  next();
});

server.db = router.db;
server.use(middleware);
server.use(auth);
server.use(rules);
server.use(router);

server.listen(3000, () => {
  console.log('listening on port 3000');
});

