const socket = new WebSocket("ws://192.168.0.100:81"); // Replace with your ESP32 IP

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.getElementById("x").textContent = data.x.toFixed(2);
      document.getElementById("y").textContent = data.y.toFixed(2);
      document.getElementById("z").textContent = data.z.toFixed(2);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };