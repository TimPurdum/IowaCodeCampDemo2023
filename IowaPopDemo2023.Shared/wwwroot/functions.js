let chart;

export function getWindowWidth() {
  return document.body.clientWidth;
}

export function createChart(chartData, chartLabel, labels, canvasElement) {
  if (chart !== undefined && chart !== null) {
    chart.destroy();
  }
  chart = new Chart(canvasElement, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data: chartData,
        borderWidth: 1,
        backgroundColor: generateColors(chartData)
      }],
    }
  });
}

function generateColors(chartData) {
    const sortedData = chartData.slice().sort((a, b) => a - b);
    const max = sortedData[sortedData.length - 1];
    const min = sortedData[0];
    const range = max - min;
    const colors = [];
    for (let i = 0; i < chartData.length; i++) {
        const value = chartData[i];
        const position = sortedData.indexOf(value);
        const red = Math.round(255 - (position / (chartData.length - 1) * 255));
        const green = Math.round(position / (chartData.length - 1) * 255);
        const blue = 0;
        const color = `rgba(${red}, ${green}, ${blue}, 0.2)`;
        colors.push(color);
    }
    return colors;
}
