import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/doctor_model.dart';
import 'package:patient_app/utils/constants.dart';

class DoctorApiService {

  Future<List<DoctorModel>> fetchDoctors({
    required String hospitalId,
    required String departmentId,
    //required String token,
  }) async {
    final response = await http.get(
      Uri.parse(
        "$baseUrl/doctors/hospital/$hospitalId/department/$departmentId",
      ),
      // headers: {
      //   //"Authorization": "Bearer $token",
      //   "Content-Type": "application/json",
      // },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List list = data['doctors'];
      print(data);

      return list.map((e) => DoctorModel.fromJson(e)).toList();
    } else {
      throw Exception("Failed to load doctors");
    }
  }
}
