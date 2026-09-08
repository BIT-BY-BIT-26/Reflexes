import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/pharmacy_model.dart';
import 'package:patient_app/utils/constants.dart';

class PharmacyService {
  

  Future<List<Pharmacy>> getAvailablePharmacies() async {
  final url = "$baseUrl/pharmacy/available";

  debugPrint("PHARMACY URL: $url");

  final response = await http.get(
    Uri.parse(url),
  );

  debugPrint("STATUS CODE: ${response.statusCode}");
  debugPrint("RESPONSE: ${response.body}");

  if (response.statusCode != 200) {
    throw Exception(
      "Pharmacy API failed: ${response.statusCode} ${response.body}",
    );
  }

  final data = jsonDecode(response.body);

  debugPrint("PARSED DATA: $data");

  if (data['success'] != true) {
    throw Exception(
      data['message'] ?? "Failed to fetch pharmacies",
    );
  }

  return (data['pharmacies'] as List)
      .map((json) => Pharmacy.fromJson(json))
      .toList();
}
}