import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:patient_app/utils/constants.dart';

class RouteService {

  Future<List<LatLng>> fetchRoute({
    required double patientLat,
    required double patientLng,
    required String hospitalId,
  }) async {
    final res = await http.post(
      Uri.parse("$baseUrl/hospitals/route-to-hospital"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "patientLat": patientLat,
        "patientLng": patientLng,
        "hospitalId": hospitalId,
      }),
    );

    final data = jsonDecode(res.body);

    final coords =
        data['routeGeoJSON']['features'][0]['geometry']['coordinates'];

    return coords
        .map<LatLng>((c) => LatLng(c[1], c[0]))
        .toList();
  }
}
