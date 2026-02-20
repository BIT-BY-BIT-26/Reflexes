import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/hospital_model.dart';

class HospitalService {
  static const String baseUrl = "http://10.69.119.145:3000/api/hospitals";

  Future<List<String>> getStates() async {
    final res = await http.get(Uri.parse("$baseUrl/states"));
    final data = jsonDecode(res.body);
    return List<String>.from(data['data']);
  }

  Future<List<String>> getCities(String state) async {
    final res =
        await http.get(Uri.parse("$baseUrl/cities?state=$state"));
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
    String url = baseUrl;
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
      return (data['data'] as List)
          .map((e) => Hospital.fromJson(e))
          .toList();
    } else {
      throw Exception("Failed to load hospitals");
    }
  }
}
