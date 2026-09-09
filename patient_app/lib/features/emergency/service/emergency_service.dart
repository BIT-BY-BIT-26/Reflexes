import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/emergency_model.dart';
import 'package:patient_app/utils/constants.dart';

class EmergencyService {
  /// Response bodies are not guaranteed to be JSON: Express serves its 404 and
  /// 500 pages as HTML, and a dropped connection gives an empty body. Decoding
  /// those blind throws a FormatException that would surface raw in the UI, so
  /// anything unparseable degrades to an empty map and the caller falls back to
  /// a readable message.
  Map<String, dynamic> _decode(http.Response response) {
    if (response.body.isEmpty) return const <String, dynamic>{};

    try {
      final decoded = jsonDecode(response.body);
      return decoded is Map<String, dynamic>
          ? decoded
          : const <String, dynamic>{};
    } on FormatException {
      return const <String, dynamic>{};
    }
  }

  /// Keeps the HTTP status in the message so a misrouted or stale server is
  /// diagnosable from the screen instead of looking like a generic outage.
  String _failure(Map<String, dynamic> data, http.Response response,
      String fallback) {
    return data["message"] ??
        data["msg"] ??
        "$fallback (server returned ${response.statusCode})";
  }

  /// POST /api/emergency
  ///
  /// The backend takes latitude and longitude as separate top-level numbers,
  /// not a coordinate array - it does the [lng, lat] GeoJSON swap itself.
  ///
  /// A 409 means the patient already has an ongoing request and the body
  /// carries it. That is not a failure from the UI's point of view: either way
  /// there is an active emergency to show, so it is returned like a success.
  Future<EmergencyModel> createEmergency({
    required String token,
    required String hospitalId,
    required double latitude,
    required double longitude,
    required String reason,
    String message = "",
  }) async {
    final response = await http.post(
      Uri.parse("$baseUrl/emergency"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "hospitalId": hospitalId,
        "latitude": latitude,
        "longitude": longitude,
        "reason": reason,
        "message": message,
      }),
    );

    final data = _decode(response);

    if (response.statusCode == 201 || response.statusCode == 409) {
      final emergency = data["emergency"];
      if (emergency is Map<String, dynamic>) {
        return EmergencyModel.fromJson(emergency);
      }
    }

    throw Exception(_failure(data, response, "Emergency request failed"));
  }

  /// GET /api/emergency/my/active - null when nothing is ongoing.
  Future<EmergencyModel?> getActiveEmergency(String token) async {
    final response = await http.get(
      Uri.parse("$baseUrl/emergency/my/active"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    final data = _decode(response);

    if (response.statusCode == 200) {
      final emergency = data["emergency"];
      return emergency is Map<String, dynamic>
          ? EmergencyModel.fromJson(emergency)
          : null;
    }

    throw Exception(
      _failure(data, response, "Failed to load emergency status"),
    );
  }

  /// PATCH /api/emergency/:id/cancel
  ///
  /// Only valid up to ON_THE_WAY; once the ambulance has ARRIVED the server
  /// returns 409 and the request has to be stood down with the hospital
  /// directly.
  Future<EmergencyModel> cancelEmergency({
    required String token,
    required String emergencyId,
  }) async {
    final response = await http.patch(
      Uri.parse("$baseUrl/emergency/$emergencyId/cancel"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    final data = _decode(response);

    if (response.statusCode == 200) {
      final emergency = data["emergency"];
      if (emergency is Map<String, dynamic>) {
        return EmergencyModel.fromJson(emergency);
      }
    }

    throw Exception(
      _failure(data, response, "Could not cancel the request"),
    );
  }
}
