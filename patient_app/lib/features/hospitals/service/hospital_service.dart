import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/hospital_model.dart';
import 'package:patient_app/utils/constants.dart';

class HospitalService {
  Future<List<String>> getStates() async {
    final res = await http.get(Uri.parse("$baseUrl/hospitals/states"));
    final data = jsonDecode(res.body);
    return List<String>.from(data['data']);
  }

  Future<List<String>> getCities(String state) async {
    final res = await http.get(
      Uri.parse("$baseUrl/hospitals/cities?state=$state"),
    );
    final data = jsonDecode(res.body);
    return List<String>.from(data['data']);
  }

  // Future<List<Hospital>> getHospitals({
  //   String? state,
  //   String? city,
  // }) async {
  //   String url = baseUrl;
  //   List<String> query = [];

  //   if (state != null && state != "All") {
  //     query.add("state=${Uri.encodeComponent(state)}");
  //   }
  //   if (city != null && city != "All") {
  //     query.add("city=${Uri.encodeComponent(city)}");
  //   }
  //   if (query.isNotEmpty) {
  //     url += "?${query.join("&")}";
  //   }

  //   final response = await http.get(Uri.parse(url));

  //   final data = jsonDecode(response.body);

  //   if (response.statusCode == 200) {
  //     return (data['data'] as List)
  //         .map((e) => Hospital.fromJson(e))
  //         .toList();
  //   } else {
  //     throw Exception("Failed to load hospitals");
  //   }

  // }

  Future<List<Hospital>> getHospitals({
    String? state,
    String? city,
    double? lat,
    double? lng,
    double radius = 5,
  }) async {
    String url = "$baseUrl/hospitals";
    List<String> query = [];

    if (state != null && state != "All") {
      query.add("state=${Uri.encodeComponent(state)}");
    }
    if (city != null && city != "All") {
      query.add("city=${Uri.encodeComponent(city)}");
    }
    if (lat != null && lng != null) {
      query.add("lat=$lat");
      query.add("lng=$lng");
      query.add("radius=$radius");
    }

    if (query.isNotEmpty) {
      url += "?${query.join("&")}";
    }

    final response = await http.get(Uri.parse(url));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (data['data'] as List).map((e) => Hospital.fromJson(e)).toList();
    } else {
      throw Exception("Failed to load hospitals");
    }
  }

  Future<Hospital> getHospitalProfile(String hospitalId) async {
    try {
      final response = await http.get(
        Uri.parse("$baseUrl/hospitals/profile/$hospitalId"),
        headers: {
          //"Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );
      print("response of HOSPITAL ${response.body}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        return Hospital.fromJson(data["data"]);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error["message"] ?? "Failed to fetch hospital profile");
      }
    } catch (e) {
      throw Exception("Error fetching hospital profile: $e");
    }
  }
}
