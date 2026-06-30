import 'package:flutter/foundation.dart';

import 'package:patient_app/features/appointment/service/book_appointemt_service.dart';
import 'package:patient_app/models/appointment_model.dart';

class AppointmentProvider with ChangeNotifier {
  List<AppointmentModel> _appointments = [];
  bool _isLoading = false;

  List<AppointmentModel> get appointments => _appointments;
  bool get isLoading => _isLoading;

  Future<void> fetchMyAppointments(String token) async {
    print("fetchMyAppointments called");
    _isLoading = true;
    notifyListeners();

    try {
      _appointments = await AppointmentService.getMyAppointments(token);
      print(_appointments);
    } catch (e) {
      _appointments = [];
      debugPrint("Error fetching appointments: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  // 🔥 SOCKET UPDATE
  void confirmAppointmentSocket({
    required String appointmentId,
    // required int token,
    int? token,
  }) {
    final index = _appointments.indexWhere((a) => a.id == appointmentId);

    if (index != -1) {
      // _appointments[index].status = "CONFIRMED";
      // _appointments[index].token = token;
      final appt = _appointments[index];
      appt.status = "CONFIRMED";

      if (appt.appointmentType == "offline") {
        appt.token = token;
      } else {
        appt.token = null;
      }
      notifyListeners();
    }
  }
}
