import settings from 'settings';

const launchHistory = (pastLaunches) => {
  const yearsStart = 2006; // First Falcon 1 flight
  const yearsEnd = new Date().getFullYear();
  const years = [];
  for (let i = yearsStart; i <= yearsEnd; i++) {
    years.push(i);
  }

  const falcon1Flights = new Array(years.length).fill(0);
  const falcon9UnprovenFlights = new Array(years.length).fill(0);
  const falcon9ProvenFlights = new Array(years.length).fill(0);
  const falconHeavyUnprovenFlights = new Array(years.length).fill(0);
  const falconHeavyProvenFlights = new Array(years.length).fill(0);
  const failureFlights = new Array(years.length).fill(0);

  const flights = [];
  const successRateFalcon9 = [];
  const successRateAll = [];
  let falcon9LaunchesCount = 0;
  let failuresFalcon9 = 0;
  let failuresAll = 0;

  for (let i = 0; i < pastLaunches.length; i++) {
    const launch = pastLaunches[i];
    flights.push(`#${i + 1}`);

    // Build success rate chart
    if (launch.launch_success === false) {
      failuresAll++;
      if (launch.rocket.rocket_id === 'falcon9') {
        failuresFalcon9++;
      }
    }
    if (launch.rocket.rocket_id === 'falcon9') {
      falcon9LaunchesCount++;
      successRateFalcon9.push(100 * (falcon9LaunchesCount - failuresFalcon9) / falcon9LaunchesCount);
    } else {
      successRateFalcon9.push(null);
    }
    successRateAll.push(100 * (i + 1 - failuresAll) / (i + 1));

    // If failure, put in failures then ignore
    const yearIndex = launch.launch_year - yearsStart;
    if (launch.launch_success === false) {
      failureFlights[yearIndex]++;
      continue;
    }

    switch (launch.rocket.rocket_id) {
      case 'falcon1':
        falcon1Flights[yearIndex]++;
        break;

      case 'falcon9':
        if (launch.reused) {
          falcon9ProvenFlights[yearIndex]++;
        } else {
          falcon9UnprovenFlights[yearIndex]++;
        }
        break;

      case 'falconheavy':
        if (launch.reused) {
          falconHeavyProvenFlights[yearIndex]++;
        } else {
          falconHeavyUnprovenFlights[yearIndex]++;
        }
        break;

      default:
    }
  }

  let options = JSON.parse(JSON.stringify(settings.DEFAULTCHARTOPTIONS)); // Clone object
  options = Object.assign(options, JSON.parse(JSON.stringify(settings.DEFAULTBARCHARTOPTIONS)));

  const optionsLaunchHistory = JSON.parse(JSON.stringify(options));
  optionsLaunchHistory.tooltips = {
    mode: 'label',
    callbacks: {
      afterTitle: () => {
        window.launchTotal = 0;
      },
      label: (tooltipItem, data) => {
        const dataset = data.datasets[tooltipItem.datasetIndex];
        const count = parseFloat(dataset.data[tooltipItem.index]);
        window.launchTotal += count;
        return dataset.label + ': ' + count.toString();
      },
      footer: () => {
        return 'TOTAL: ' + window.launchTotal.toString();
      },
    },
  };

  const optionsSuccessRate = JSON.parse(JSON.stringify(options));
  optionsSuccessRate.scales.xAxes[0].stacked = false;
  optionsSuccessRate.scales.yAxes[0].stacked = false;
  optionsSuccessRate.tooltips = {
    mode: 'label',
    callbacks: {
      label: (tooltipItem, data) => {
        const dataset = data.datasets[tooltipItem.datasetIndex];
        const rate = parseFloat(dataset.data[tooltipItem.index]);
        window.total += rate;
        return dataset.label + ': ' + rate.toFixed(2) + '%';
      },
    },
  };

  const flightsPerYear = {
    data: {
      labels: years,
      datasets: [{
        label: 'Falcon 1',
        backgroundColor: settings.COLORS.green,
        data: falcon1Flights,
      }, {
        label: 'New Falcon 9',
        backgroundColor: settings.COLORS.blue,
        data: falcon9UnprovenFlights,
      }, {
        label: 'Used Falcon 9',
        backgroundColor: settings.COLORS.lightblue,
        data: falcon9ProvenFlights,
      }, {
        label: 'New Falcon Heavy',
        backgroundColor: settings.COLORS.orange,
        data: falconHeavyUnprovenFlights,
      }, {
        label: 'Used Falcon Heavy',
        backgroundColor: settings.COLORS.yellow,
        data: falconHeavyProvenFlights,
      }, {
        label: 'Failure',
        backgroundColor: settings.COLORS.red,
        data: failureFlights,
      }]
    },
    options: optionsLaunchHistory,
  };

  const successRates = {
    data: {
      labels: flights,
      datasets: [{
        label: 'Falcon 9',
        type: 'line',
        data: successRateFalcon9,
        fill: false,
        borderColor: settings.COLORS.yellow,
        backgroundColor: settings.COLORS.yellow,
        pointBorderColor: settings.COLORS.yellow,
        pointBackgroundColor: settings.COLORS.yellow,
        pointHoverBackgroundColor: settings.COLORS.yellow,
        pointHoverBorderColor: settings.COLORS.yellow,
      }, {
        label: 'All rockets',
        type: 'line',
        data: successRateAll,
        fill: false,
        borderColor: settings.COLORS.blue,
        backgroundColor: settings.COLORS.blue,
        pointBorderColor: settings.COLORS.blue,
        pointBackgroundColor: settings.COLORS.blue,
        pointHoverBackgroundColor: settings.COLORS.blue,
        pointHoverBorderColor: settings.COLORS.blue,
      }]
    },
    options: optionsSuccessRate,
  };

  return {
    flightsPerYear,
    successRates,
  };
};

export default launchHistory;
