# virtualworld_sdc

# 🌍 Virtual World Editor – IoT Sensor Mapping Interface

This project is an interactive map editor developed in **JavaScript** for creating, visualizing, and configuring a **virtual world populated with buildings, roads, trees, and connected IoT sensors.**

> It is a standalone front-end tool for simulating and visualizing a connected infrastructure (city, factory, farm, etc.) with dynamic display, live camera feeds, and real-time interactions.

## 📸 Interface Preview

Here are some screenshots of the editor:  
![Virtual Editor Preview](Capture%20d'%C3%A9cran%202025-05-23%20125918.png)

---

## 🧩 Key Features

### 🛠 Graphical Editor

-   Creation of a **road graph** by adding connected points.
-   Automatic generation of buildings, roads, and trees around the graph.

### 🧱 Virtual Components

-   Generation of **simulated 3D buildings** from graph segments.
-   Random addition of trees respecting spatial and environmental constraints.

### 📡 IoT Sensor Editor

-   Vertical navigation containing **icons of connected sensors** (temperature, humidity, barriers, cameras, etc.).
-   Drag & Drop of sensors onto the map with scaling and visual effects.
-   Display of data (name, position) in an information panel.
-   **Sensor Configuration:** Each sensor is fully configurable, allowing users to define its properties and behavior.

### 🎥 Dynamic Video Display

-   Support for real video streams via `getUserMedia()` for `Camera.png` type sensors.
-   Support for external video streams via URLs (HLS or MP4).
-   Video window displayed when a compatible sensor is selected.

### 🌐 Integration with ArcGIS API

-   **Automatic World Generation:** Connects to the ArcGIS API to automatically create the virtual world based on real-world geographical data.
-   **Site/Zone Definition:** Supports the creation of virtual worlds based on defined sites, zones, and multi-level zones.
-   **Sensor Placement:** Enables the placement of sensors within specific zones for targeted monitoring and control.

### ⚙️ Communication Protocol Support

-   **Versatile Protocol Integration:** Sensors can be attached to various communication protocols, including:
    -   Modbus
    -   LoRa
    -   MQTT
    -   OPC-UA
    -   gRPC
    -   WebSockets
    -   DDS
    -   SMPP
    -   XMPP
    -   Zigbee
    -   LoRaWAN
-   **Protocol Configuration:** Allows users to configure the specific parameters for each communication protocol, ensuring seamless integration with diverse IoT devices and systems.

---

