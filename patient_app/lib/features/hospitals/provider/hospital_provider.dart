// import 'package:flutter/material.dart';
// import 'package:meditrack_patient_app/models/hospital_model.dart';
// import '../services/hospital_service.dart';

// class HospitalProvider extends ChangeNotifier {
//   final HospitalService _service = HospitalService();

//   List<Hospital> hospitals = [];
//   bool loading = false;

//   String selectedState = "All";
//   String selectedCity = "All";

//   Future<void> fetchHospitals() async {
//     loading = true;
//     notifyListeners();

//     hospitals = await _service.getHospitals(
//       state: selectedState,
//       city: selectedCity,
//     );

//     loading = false;
//     notifyListeners();
//   }

//   void setState(String value) {
//     selectedState = value;
//     selectedCity = "All";
//     fetchHospitals();
//   }

//   void setCity(String value) {
//     selectedCity = value;
//     fetchHospitals();
//   }
// }

import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/hospitals/service/hospital_service.dart';
import 'package:patient_app/helpers/location_helper.dart';
import 'package:patient_app/models/hospital_model.dart';
import 'package:provider/provider.dart';

class HospitalProvider extends ChangeNotifier {
  final HospitalService service = HospitalService();

  // =====================
  // DROPDOWN DATA
  // =====================
  List<String> states = ["All"];
  List<String> cities = ["All"];

  String selectedState = "All";
  String selectedCity = "All";

  List<Hospital> hospitals = [];
  List<Hospital> nearbyHospitals = [];

  Hospital? hospitalProfile;
  bool profileLoading = false;
  String? profileError;

  // =====================
  // UI STATE
  // =====================
  bool loading = false;
  bool isNearbyMode = false;

  String? error;

  // =====================
  // LOAD STATES (on screen open)
  // =====================
  Future<void> loadStates() async {
    try {
      loading = true;
      notifyListeners();

      final data = await service.getStates();
      states = ["All", ...data];
      error = null;
    } catch (e) {
      error = "Failed to load states";
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  //===========================
  //HOSPITAL PROFILE
  //===========================
  Future<void> fetchHospitalProfile(String id) async {
    try {
      profileLoading = true;
      profileError = null;
      notifyListeners();

      //final token = Provider.of<AuthProvider>(context, listen: false).token;

      // if (token == null) {
      //   throw Exception("Token not found");
      // }

      hospitalProfile = await service.getHospitalProfile(id);
    } catch (e) {
      profileError = e.toString();
    } finally {
      profileLoading = false;
      notifyListeners();
    }
  }

  // =====================
  // LOAD CITIES (when state changes)
  // =====================
  Future<void> loadCities(String state) async {
    try {
      loading = true;
      notifyListeners();

      if (state == "All") {
        cities = ["All"];
      } else {
        final data = await service.getCities(state);
        cities = ["All", ...data];
      }
      error = null;
    } catch (e) {
      error = "Failed to load cities";
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  // =====================
  // FETCH HOSPITALS
  // =====================
  Future<void> fetchHospitals() async {
    try {
      loading = true;
      isNearbyMode = false;
      notifyListeners();

      hospitals = await service.getHospitals(
        state: selectedState,
        city: selectedCity,
      );
      error = null;
    } catch (e) {
      error = "Failed to load hospitals";
      hospitals = [];
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  //========================
  // FETCH NEARBY HOSPITALS
  //========================
  Future<void> fetchNearbyHospitals() async {
    if (nearbyHospitals.isNotEmpty) {
      return;
    }
    try {
      loading = true;
      isNearbyMode = true;
      notifyListeners();

      final position = await LocationHelper.getCurrentLocation();

      nearbyHospitals = await service.getHospitals(
        lat: position.latitude,
        lng: position.longitude,
        radius: 5000,
      );

      error = null;
    } catch (e) {
      error = e.toString();
      nearbyHospitals = [];
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  // =====================
  // STATE SELECTED
  // =====================
  Future<void> onStateSelected(String value) async {
    selectedState = value;
    selectedCity = "All";

    await loadCities(value);
    await fetchHospitals();
  }

  // =====================
  // CITY SELECTED
  // =====================
  Future<void> onCitySelected(String value) async {
    selectedCity = value;
    await fetchHospitals();
  }

  // =====================
  // INITIAL LOAD
  // =====================
  Future<void> init() async {
    await loadStates();
    await fetchHospitals();
  }
}
