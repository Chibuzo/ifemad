$(function () {
    var chart = {
        series: [
            {
                name: "Selling Product",
                data: [28, 120, 36, 90, 38, 85,],
            }
        ],
        chart: {
            toolbar: {
                show: false,
            },
            type: "line",
            fontFamily: "DM Sans,sans-serif",
            foreColor: "#adb0bb",
            height: 200,
        },
        colors: ["#fa896b", "#615dff", "#3dd9eb"],
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        grid: {
            borderColor: "rgba(0,0,0,0.1)",
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
            ],
        },
        yaxis: {
            tickAmount: 4,
        },
        tooltip: {
            theme: "dark",
        },
    };

    var chart = new ApexCharts(document.querySelector("#financial"), chart);
    chart.render();
});
