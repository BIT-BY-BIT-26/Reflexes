import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:patient_app/models/medicine_model.dart';
import 'package:patient_app/utils/constants.dart';

class MedicineService {
  

  Future<List<Medicine>> getMedicinesByPharmacy(
    String pharmacyId,
  ) async {
    final response = await http.get(
      Uri.parse(
        "$baseUrl/pharmacy/medicine/$pharmacyId",
      ),
    );

    if (response.statusCode != 200) {
      throw Exception(
        "Failed to fetch medicines",
      );
    }

    final data = jsonDecode(response.body);

    if (data['success'] != true) {
      throw Exception(
        data['message'] ??
            "Failed to fetch medicines",
      );
    }

    return (data['medicines'] as List)
        .map(
          (json) => Medicine.fromJson(json),
        )
        .toList();
  }
}