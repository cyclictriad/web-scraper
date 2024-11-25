import { liveMetricsState } from "~/store";


export function updateCoursesandSubjects() {
    const ws = new WebSocket(`ws://localhost:3000/api/metrics-ws`);

    ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send(JSON.stringify({ userId: useCookie("_id").value }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
            liveMetricsState.value.loading = false;
            liveMetricsState.value.error = true;
            console.error("Server error:", data.error);
        } else if (data.message === "Connected Successfully") {
            liveMetricsState.value.error = false;
            liveMetricsState.value.loading = true;
            console.log("Successfully authenticated");
        } else if (data.type === "close") {
            liveMetricsState.value.loading = false;
            const setupQuizzesCookie = useCookie("setup-flashcards");
            setupQuizzesCookie.value = null;
            ws.close();
        }
    };

    ws.onclose = () => {
        liveMetricsState.value.loading = false;
        console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
        liveMetricsState.value.error = true;
        console.error("WebSocket error:", error);
    };
};