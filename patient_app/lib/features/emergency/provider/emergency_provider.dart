import 'package:flutter/material.dart';
import 'package:patient_app/features/emergency/service/emergency_service.dart';
import 'package:patient_app/models/emergency_model.dart';

class EmergencyProvider extends ChangeNotifier {
  final EmergencyService _service = EmergencyService();

  EmergencyModel? active;

  bool isSubmitting = false;
  bool isLoading = false;
  String? error;

  bool get hasActive => active != null;

  String _clean(Object e) => e.toString().replaceFirst("Exception: ", "");

  /// Files a new emergency. Returns true when there is an active emergency to
  /// show afterwards - including the case where one was already open (409).
  Future<bool> sendEmergency({
    required String token,
    required String hospitalId,
    required double latitude,
    required double longitude,
    required String reason,
    String message = "",
  }) async {
    try {
      isSubmitting = true;
      error = null;
      notifyListeners();

      active = await _service.createEmergency(
        token: token,
        hospitalId: hospitalId,
        latitude: latitude,
        longitude: longitude,
        reason: reason,
        message: message,
      );
      return true;
    } catch (e) {
      error = _clean(e);
      return false;
    } finally {
      isSubmitting = false;
      notifyListeners();
    }
  }

  /// Refreshes [active] from the server. Still the way state is restored on app
  /// launch, and the fallback whenever the socket is down - `applyLiveUpdate`
  /// only covers changes that happen while the app is connected and listening.
  Future<void> loadActive(String token) async {
    try {
      isLoading = true;
      error = null;
      notifyListeners();

      active = await _service.getActiveEmergency(token);
    } catch (e) {
      error = _clean(e);
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Calls off the open request. On success [active] is replaced by the
  /// CANCELLED document, which is terminal - the backend's duplicate guard no
  /// longer counts it, so the patient can file a fresh emergency straight away.
  Future<bool> cancelEmergency({
    required String token,
    required String emergencyId,
  }) async {
    try {
      isSubmitting = true;
      error = null;
      notifyListeners();

      active = await _service.cancelEmergency(
        token: token,
        emergencyId: emergencyId,
      );
      return true;
    } catch (e) {
      error = _clean(e);
      return false;
    } finally {
      isSubmitting = false;
      notifyListeners();
    }
  }

  /// Applies an `emergency-status-updated` payload pushed over the socket.
  ///
  /// Ignores anything that is not the request currently on screen: the room is
  /// per-patient, but a stale event for an older request would otherwise
  /// resurrect it over the live one.
  void applyLiveUpdate(EmergencyModel updated) {
    if (active != null && active!.id != updated.id) return;

    active = updated;
    error = null;
    notifyListeners();
  }

  void clear() {
    active = null;
    error = null;
    notifyListeners();
  }
}
