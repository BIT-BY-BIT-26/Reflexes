import 'package:flutter/material.dart';
import 'package:patient_app/features/queue/service/queue_service.dart';
import 'package:patient_app/models/queue_model.dart';

class QueueProvider extends ChangeNotifier {
  final QueueService _service = QueueService();

  ActiveQueueModel? queue;
  bool isLoading = false;

  Future<void> loadQueue(String token) async {
    isLoading = true;
    notifyListeners();

    try {
      queue = await _service.getActiveQueue(token);

      if (queue != null) {
        if (queue!.isOpdClosed == true) {
          queue = _copyWith(notification: "The OPD has ended");
        } else if (queue!.isPaused == true) {
          queue = _copyWith(notification: "The OPD has been paused");
        } else if (queue!.currentToken == null || queue!.currentToken == 0) {
          queue = _copyWith(
            notification: "The consultation has not started yet",
          );
        } else {
          queue = _copyWith(notification: "The OPD is ongoing");
        }
      }
    } catch (e) {
      debugPrint(e.toString());
      queue = null;
    }

    isLoading = false;
    notifyListeners();
  }

  ActiveQueueModel _copyWith({
    int? currentToken,
    bool? isPaused,
    bool? isOpdClosed,
    String? notification,
  }) {
    return ActiveQueueModel(
      hasActiveQueue: queue!.hasActiveQueue,
      appointmentId: queue!.appointmentId,
      doctorId: queue!.doctorId,
      doctorName: queue!.doctorName,
      department: queue!.department,
      currentToken: currentToken ?? queue!.currentToken,
      yourToken: queue!.yourToken,
      patientsAhead: queue!.yourToken == null
          ? 0
          : (queue!.yourToken! <= (currentToken ?? queue!.currentToken ?? 0)
                ? 0
                : queue!.yourToken! -
                      (currentToken ?? queue!.currentToken ?? 0)),
      isPaused: isPaused ?? queue!.isPaused,
      isOpdClosed: isOpdClosed ?? queue!.isOpdClosed,
      notification: notification ?? queue!.notification,
    );
  }

  // ==========================
  // SOCKET EVENTS
  // ==========================

  void updateCurrentToken(int token) {
    if (queue == null) return;

    String message = "The OPD is ongoing";

    if (queue!.yourToken == token) {
      message = "It's your turn";
    }

    if (queue!.yourToken != null && token > queue!.yourToken!) {
      message = "Your turn is done";
    }

    queue = _copyWith(
      currentToken: token,
      notification: message,
      isPaused: false,
      isOpdClosed: false,
    );

    notifyListeners();
  }

  void pauseQueue() {
    if (queue == null) return;

    queue = _copyWith(isPaused: true, notification: "The OPD has been paused");

    notifyListeners();
  }

  void resumeQueue(int currentToken) {
    if (queue == null) return;

    String message = "The OPD has resumed";

    if (queue!.yourToken == currentToken) {
      message = "It's your turn";
    }

    queue = _copyWith(
      currentToken: currentToken,
      isPaused: false,
      notification: message,
    );

    notifyListeners();
  }

  void stopQueue() {
    if (queue == null) return;

    queue = _copyWith(
      isPaused: false,
      isOpdClosed: true,
      notification: "The OPD has ended",
    );

    notifyListeners();
  }
}
