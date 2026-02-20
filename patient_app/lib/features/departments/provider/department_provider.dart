import 'package:flutter/material.dart';
import 'package:patient_app/features/departments/service/departmet_service.dart';
import 'package:patient_app/models/department_model.dart';


class DepartmentProvider extends ChangeNotifier {
  final DepartmentApiService _apiService = DepartmentApiService();

  bool isLoading = false;
  List<DepartmentModel> departments = [];

  Future<void> fetchDepartments(String hospitalId) async {
    isLoading = true;
    notifyListeners();

    try {
      departments = await _apiService.getDepartmentsByHospital(hospitalId);
    } catch (e) {
      departments = [];
    }

    isLoading = false;
    notifyListeners();
  }
}
