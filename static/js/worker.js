'use strict';

//getEnergySum in dz_interaction.py of https://github.com/DAISEE/Scripts

/* @params  = {
  apiURL
  dataTime
  t0
  t1
  sensorId
}*/

onmessage = params => {		

	let data,
	sumEnergy = 0,
	timestp = 0,
	url = `${params.apiURL}/api/${params.sensorId}/get/watts/by_time/${params.t0}/${params.t1}`;

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
		postMessage(sumEnergy);
	})
	.then(err => {
		console.log(`Request Failed ${err}`)
	})

}
