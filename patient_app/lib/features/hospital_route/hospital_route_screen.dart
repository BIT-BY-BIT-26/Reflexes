import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:patient_app/features/hospital_route/provider/hospital_route_provider.dart';
import 'package:provider/provider.dart';

class NavigationMapScreen extends StatefulWidget {
  final String hospitalId;
  const NavigationMapScreen({super.key, required this.hospitalId});

  @override
  State<NavigationMapScreen> createState() => _NavigationMapScreenState();
}

class _NavigationMapScreenState extends State<NavigationMapScreen> {
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();

    // 1️⃣ Start navigation in provider
    Future.microtask(() {
      final navProvider = context.read<NavigationProvider>();
      navProvider.startNavigation(widget.hospitalId);

      // 2️⃣ Safe camera move after FlutterMap renders
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (navProvider.patientLocation != null) {
          _mapController.move(navProvider.patientLocation!, 16);
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final nav = context.watch<NavigationProvider>();

    // 3️⃣ Show loading until patient location is available
    if (nav.patientLocation == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Live Navigation")),
      body: FlutterMap(
        mapController: _mapController,
        options: MapOptions(
          initialCenter: nav.patientLocation!,
          initialZoom: 16,
          onPositionChanged: (pos, hasGesture) {
            // Optional: track user gestures if needed
          },
        ),
        children: [
          // 4️⃣ OSM Tiles
          TileLayer(
            urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            userAgentPackageName: 'com.example.patient_app',
          ),

          // 5️⃣ Route Polyline
          PolylineLayer(
            polylines: [
              Polyline(
                points: nav.routePoints,
                strokeWidth: 4,
                color: Colors.blue,
              ),
            ],
          ),

          // 6️⃣ Patient marker (live)
          MarkerLayer(
            markers: [
              Marker(
                point: nav.patientLocation!,
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.navigation,
                  color: Colors.red,
                  size: 40,
                ),
              ),
            ],
          ),

          // Optional: Hospital marker
          // if (nav.hospitalLocation != null)
          //   MarkerLayer(
          //     markers: [
          //       Marker(
          //         point: nav.hospitalLocation!,
          //         width: 40,
          //         height: 40,
          //         child: const Icon(
          //           Icons.local_hospital,
          //           color: Colors.green,
          //           size: 40,
          //         ),
          //       ),
          //     ],
          //   ),
        ],
      ),
    );
  }
}
