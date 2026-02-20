import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:patient_app/models/department_model.dart';
import 'package:patient_app/utils/constants.dart';

class DepartmentApiService {

  Future<List<DepartmentModel>> getDepartmentsByHospital(
      String hospitalId) async {
    final response = await http.get(
      Uri.parse("$baseUrl/departments/hospital/$hospitalId"),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      List list = data['departments'];

      return list
          .map((e) => DepartmentModel.fromJson(e))
          .toList();
    } else {
      throw Exception("Failed to load departments");
    }
  }
}
