<script>
document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById("graficoOcupacao");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
            datasets: [{
                label: "Ocupação (%)",
                data: [62, 70, 58, 81, 88, 92, 75],
                borderWidth: 3,
                tension: 0.35,
                borderColor: "#00aaff",
                backgroundColor: "rgba(0, 170, 255, .15)",
                fill: true,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: "rgba(255,255,255,0.06)" }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

});
</script>
