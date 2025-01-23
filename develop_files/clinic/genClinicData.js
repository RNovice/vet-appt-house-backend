const axios = require('axios')
const fs = require('fs')

function genServices(name) {
  const services = [
    { id: 1, name: "內科", proportion: 98 },
    { id: 2, name: "外科", proportion: 75 },
    { id: 3, name: "皮膚科", proportion: 65 },
    { id: 4, name: "疫苗接種", proportion: 95 },
    { id: 5, name: "結紮手術", proportion: 85 },
    { id: 6, name: "牙科", proportion: 55 },
    { id: 7, name: "影像診斷", proportion: 65 },
    { id: 8, name: "急診", proportion: 50 },
    { id: 9, name: "行為診療", proportion: 15 },
    { id: 10, name: "眼科", proportion: 35 },
    { id: 11, name: "腫瘤科", proportion: 20 },
    { id: 12, name: "泌尿科", proportion: 45 },
    { id: 13, name: "復健科", proportion: 15 },
    { id: 14, name: "寄生蟲防治", proportion: 90 },
    { id: 15, name: "繁殖服務", proportion: 25 },
    { id: 16, name: "特殊動物", proportion: (name.includes('特殊') || name.includes('特寵')) ? 100 : 10 }
  ];

  const result = [];
  services.forEach(service => {
    const randomValue = Math.random() * 100;
    if (randomValue <= service.proportion) {
      result.push(service.id);
    }
  });

  return result;
}

function genTreatedAnimals(name, hasExotic) {
  const treatedAnimals = [
    { id: 1, species: "犬科", proportion: 100 },
    { id: 2, species: "貓科", proportion: 100 },
    { id: 3, species: "小型齧齒類(鼠)", proportion: name.includes('鼠') ? 100 : 30 },
    { id: 4, species: "中型齧齒類(兔)", proportion: name.includes('兔') ? 100 : 40 },
    { id: 5, species: "飛禽科", proportion: (name.includes('鳥') || name.includes('禽')) ? 100 : 25 },
    { id: 6, species: "爬蟲科", proportion: name.includes('蟲') ? 100 : 15 },
    { id: 7, species: "特寵專科", proportion: hasExotic ? 100 : 0 }
  ];

  const result = [];

  treatedAnimals.forEach(animal => {
    const randomValue = Math.random() * 100;
    if (randomValue <= animal.proportion) {
      result.push(animal.id);
    }
  });

  return result;
}

function genSchedule() {
  const proportion = [
    [0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.6], // 早
    [0.3, 0.2, 0.2, 0.2, 0.2, 0.5, 0.8], // 中
    [0.4, 0.3, 0.3, 0.3, 0.4, 0.6, 0.9]  // 晚
  ];
  return proportion.map(row =>
    row.map(ratio => Math.random() > ratio)
  );
}

function formatTel(tel) {
  const addDash = (num) => num.slice(0, 3) + "-" + num.slice(3);
  switch (true) {
    case tel === '':
    case tel === null:
      return null;
    case tel === '(02)22455852#3' || tel === '02-22455852-3':
      return '02-22455853';
    case tel === '(06)062022252':
      return '06-2022252';
    case tel === '(06)063021357':
      return '06-3021357';
    case tel === '(02)8245(02)3639':
      return '02-82453639';
    case tel.includes('#'):
      const temp = tel.split('#');
      return addDash(temp[0].replace(/[^0-9]/g, '')) + '#' + temp[1];
    case tel.includes('、'):
      const temp2 = tel.split('、');
      return addDash(temp2[0].replace(/[^0-9]/g, '')) + '、' + addDash(temp2[0].replace(/[^0-9]/g, ''));
    default:
      return addDash(tel.replace(/[^0-9]/g, ''));
  }
}

const read = fs.readFileSync('vet_img_urls.json', 'utf-8');
const lib = JSON.parse(read);
function getRandomImgUrl() {
  const numbers = [];
  while (numbers.length < 5) {
    const randomNumber = Math.floor(Math.random() * 500);
    if (!numbers.includes(randomNumber)) {
      numbers.push(lib[randomNumber].url);
    }
  }
  return numbers;
}

function checkAllDay(hours) {
  const numRows = hours.length;
  const numCols = hours[0].length;

  const result = Array(numCols).fill(true);

  for (let col = 0; col < numCols; col++) {
    for (let row = 1; row < numRows; row++) {
      if (hours[row][col] !== hours[0][col]) {
        result[col] = false;
        break;
      }
    }
  }

  return !result.some(h => h === false);
}

axios('https://www.afurkid.com/Veterinary/Json').then(({ data }) => {

  const clinics = [];
  data.forEach((obj, ix) => {
    const licenseNumber = obj.LicenceNumber;
    if (!obj.Address || !licenseNumber) return;
    if (obj.Address === '板橋中山路2段28號') obj.Address = '新北市板橋區中山路二段28號';
    if (obj.Address === '羅東鎮興東路211號') obj.Address = '宜蘭縣羅東鎮興東路211號';

    let city = obj.Address.slice(0, 3);
    if (city === '台南時') city = '臺南市';
    if (city === '台北市') city = '臺北市';
    if (city === '基隆巿') city = '基隆市';

    let district = obj.Address.slice(3, 6);
    if (district.at(1) === '區') district = district.slice(0, 2);
    if (!['鄉', '鎮', '縣', '市', '區'].some(e => district.endsWith(e))) district = null;

    const name = obj.Name;
    const services = genServices(name);
    const hasExoticPetTreat = services.includes(16);
    const treatedAnimals = genTreatedAnimals(name, hasExoticPetTreat)
    const businessHours = genSchedule()
    const tel = formatTel(obj.Tel)
    const imageUrl = Math.floor(Math.random() * 20) + 1;
    const imagesUrl = getRandomImgUrl();
    const isAllDay = checkAllDay(businessHours)
    const hasWalkInAppt = Math.random() < 0.9
    const hasParking = Math.random() > 0.5

    clinics.push({
      id: ix + 1,
      city,
      district,
      name,
      licenseNumber,
      services,
      treatedAnimals,
      businessHours,
      hasEmergency: obj.IsEmergencyDepartment,
      address: obj.Address,
      tel,
      createTime: obj.CreateTime,
      updateTime: obj.UpdateTime,
      imageUrl,
      imagesUrl,
      hasExoticPetTreat,
      isEnabled: true,
      isAllDay,
      hasWalkInAppt,
      hasParking,
      licenseInfo: {
        licenseType: obj.LicenceType,
        licenseDate: obj.LicenceDate,
        ownName: obj.OwnName,
      }
    })
  })


  fs.writeFile('clinics.json', JSON.stringify(clinics, null, '\t'), (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("JSON file saved successfully!");
    }
  });
})