import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/medicine_model.dart';
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:patient_app/utils/constants.dart';

class PharmacyService {
  /// GET /api/pharmacy/nearby
  ///
  /// Returns every APPROVED pharmacy, already sorted nearest-first with a
  /// `distanceKm` on each. No radius is sent: the backend treats it as
  /// optional, so omitting it means "all of them" rather than a silent
  /// distance window.
  Future<List<Pharmacy>> getNearbyPharmacies({
    required double lat,
    required double lng,
    String? search,
  }) async {
    final query = {
      "lat": "$lat",
      "lng": "$lng",
      if (search != null && search.isNotEmpty) "search": search,
    };

    final uri = Uri.parse("$baseUrl/pharmacy/nearby")
        .replace(queryParameters: query);

    final response = await http.get(uri);
    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return (data["data"] as List)
          .map((e) => Pharmacy.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    throw Exception(data["msg"] ?? "Failed to load nearby pharmacies");
  }

  /// GET /api/pharmacy/:pharmacyId/medicines
  ///
  /// Returns the in-stock, non-expired medicines with batches already
  /// collapsed per medicine. `search` filters on medicine name server-side.
  Future<List<Medicine>> getPharmacyMedicines({
    required String pharmacyId,
    String? search,
  }) async {
    final uri = Uri.parse("$baseUrl/pharmacy/$pharmacyId/medicines").replace(
      queryParameters: {
        if (search != null && search.isNotEmpty) "search": search,
      },
    );

    final response = await http.get(uri);
    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      return (data["medicines"] as List)
          .map((e) => Medicine.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    throw Exception(data["msg"] ?? "Failed to load medicines");
  }
}
