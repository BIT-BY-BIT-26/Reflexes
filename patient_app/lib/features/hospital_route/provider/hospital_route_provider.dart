import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:patient_app/features/hospital_route/services/hospital_route_service.dart';

class NavigationProvider extends ChangeNotifier {
  final RouteService _service = RouteService();

  List<LatLng> routePoints = [];
  LatLng? patientLocation;
  StreamSubscription<Position>? _sub;

  Future<void> startNavigation(String hospitalId) async {
    final pos = await Geolocator.getCurrentPosition();
    patientLocation = LatLng(pos.latitude, pos.longitude);

    routePoints = await _service.fetchRoute(
      patientLat: pos.latitude,
      patientLng: pos.longitude,
      hospitalId: hospitalId,
    );

    _startLiveTracking();
    notifyListeners();
  }

  void _startLiveTracking() {
    _sub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((pos) {
      patientLocation = LatLng(pos.latitude, pos.longitude);
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
