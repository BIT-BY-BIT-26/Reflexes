import 'package:flutter/material.dart';
import 'package:patient_app/features/emergency/service/emergency_service.dart';
import 'package:patient_app/models/emergency_model.dart';

class EmergencyProvider extends ChangeNotifier {
  EmergencyService? _service;
  EmergencyModel? _emergency;
  bool _isLoading = false;
  bool _isCreating = false;
  String? _error;
  EmergencyModel? get emergency => _emergency;
  bool get isLoading => _isLoading;
  bool get isCreating => _isCreating;
  String? get error => _error;

  bool get hasActiveEmergency {
    if (_emergency == null) return false;
    return _emergency!.status != 'COMPLETED' &&
        _emergency!.status != 'CANCELLED';
  }

  void initialize({
    required String token,
  }) {
    _service = EmergencyService(
      token: token,
    );
  }

  Future<bool> createEmergency({
    required double latitude,
    required double longitude,
    required String reason,
    String message = '',
  }) async {
    if (_service == null) {
      _error = 'Emergency service not initialized';
      notifyListeners();
      return false;
    }

    _isCreating = true;
    _error = null;

    notifyListeners();

    try {
      final emergency = await _service!.createEmergency(
        latitude: latitude,
        longitude: longitude,
        reason: reason,
        message: message,
      );

      _emergency = emergency;

      _isCreating = false;

      notifyListeners();

      return true;
    } catch (e) {
      _isCreating = false;
      _error = e.toString();

      notifyListeners();

      return false;
    }
  }

  Future<void> getActiveEmergency() async {
    if (_service == null) return;

    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      _emergency =
          await _service!.getActiveEmergency();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;

    notifyListeners();
  }

  Future<bool> cancelEmergency() async {
    if (_service == null ||
        _emergency == null) {
      return false;
    }

    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      final updatedEmergency =
          await _service!.cancelEmergency(
        _emergency!.id,
      );

      _emergency = updatedEmergency;

      _isLoading = false;

      notifyListeners();

      return true;
    } catch (e) {
      _isLoading = false;
      _error = e.toString();

      notifyListeners();

      return false;
    }
  }

  // Socket se emergency update aane par
  void updateEmergencyFromSocket(
    Map<String, dynamic> data,
  ) {
    try {
      _emergency =
          EmergencyModel.fromJson(data);

      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearEmergency() {
    _emergency = null;
    _error = null;

    notifyListeners();
  }
}