'use strict';

// getDateTime in dz_interaction.py of https://github.com/DAISEE/Scripts
/*
  @params = {
    pineURL
    dataTime
  }
  @cb: callback 
*/

const getDateTime = (params, cb) => {
  const url = `${params.pineURL}/api/time`;
  let data = new FormData();
  data.append('data', params.dataTime);

  fetch(url, {
    method: 'POST',
    body: data
  })
  .then(res => res.json())
  .then(cb)
  .then(err => { console.log(`Request Failed ${err}`) })
}   

// getEnergySum in dz_interaction.py of https://github.com/DAISEE/Scripts

/* 
  @params  = {
    pineURL
    dataTime
    t0
    t1
    sensorId
  }

  @cb: callback
*/

const getEnergySum = (params, cb) => {    
  const  url = `${params.pineURL}/api/${params.sensorId}/get/watts/by_time/${params.t0}/${params.t1}`;
  let data, sumEnergy = 0, timestp = 0;

  data = new FormData();
  data.append('data', params.dataTime);
  
  fetch(url, {
    method: 'POST',
    body: data
  })
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      if (timestp < item.timestamp) {
        let watt = item.value / 100;
        sumEnergy += watt;
        timestp = item.timestamp;
      }
    });
    cb(sumEnergy);
  })
  .then(err => { console.log(`Request Failed ${err}`) })
}

// onmessage worker 
/*
@params = {
  pines
  intervalTime, (milliseconds)
  intervalNbValues,
}
*/

onmessage = e => {
  let params = e.data, matrix = [];
  const pinesNames = Object.keys(params.pines);
  const pinesLength = pinesNames.length;
  postMessage([1,2,3])
  pinesNames.forEach((pine, indexNum) => {
    const dataTime = `login=${params.pines[pine].login}&password=${params.pines[pine].password}`;
    const promiseDateTime = (resolve, reject) => {
      getDateTime({
        pineURL: params.pines[pine].url,
        dataTime: dataTime,
      }, resolve)
    };

    let pTime0 = new Promise(promiseDateTime);
    let pTime1 = new Promise(promiseDateTime);
    let iReq = 0, reslist = [];

    pTime0.then(time0 => {

      setInterval(() => {
        pTime1.then(time1 => {
          getEnergySum({
            pineURL: params.pines[pine].url, 
            dataTime: dataTime, 
            t0: time0, 
            t1: time1, 
            sensorId: params.pines[pine].sensorId
          }, sumEnergy => {
            reslist.push(sumEnergy);
            iReq++;
            time0 = time1;
            if (iReq % params.intervalNbValues === 0) {
              matrix.push(reslist);
              if (indexNum === pinesLength - 1) {
                postMessage(matrix); // send matrix and call D3
              }
              reslist = []; // reset reslist  
            }
          });
        });
      }, params.intervalTime);
      
    });
  });
}
