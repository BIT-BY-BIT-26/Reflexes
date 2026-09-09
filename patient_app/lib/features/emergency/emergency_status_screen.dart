import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/emergency/provider/emergency_provider.dart';
import 'package:patient_app/models/emergency_model.dart';
import 'package:patient_app/socket.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

/// Live view of an ongoing emergency request.
///
/// The hospital's every status change arrives over the socket as
/// `emergency-status-updated`, so the ambulance's progress updates on its own.
/// Pull-to-refresh is kept as the fallback for a dropped connection or an
/// update that landed while the app was closed.
class EmergencyStatusScreen extends StatefulWidget {
  const EmergencyStatusScreen({super.key});

  static Route<void> route() {
    return MaterialPageRoute(builder: (_) => const EmergencyStatusScreen());
  }

  @override
  State<EmergencyStatusScreen> createState() => _EmergencyStatusScreenState();
}

class _EmergencyStatusScreenState extends State<EmergencyStatusScreen> {
  static const Map<String, String> _stepLabels = {
    "REQUESTED": "Request sent",
    "ACKNOWLEDGED": "Hospital acknowledged",
    "AMBULANCE_ASSIGNED": "Ambulance assigned",
    "ON_THE_WAY": "Ambulance on the way",
    "ARRIVED": "Ambulance arrived",
    "PATIENT_PICKED": "Patient picked up",
    "COMPLETED": "Completed",
    "CANCELLED": "Request cancelled",
  };

  SocketService? _socketService;

  @override
  void initState() {
    super.initState();

    Future.microtask(() async {
      if (!mounted) return;

      final auth = Provider.of<AuthProvider>(context, listen: false);
      final emergency =
          Provider.of<EmergencyProvider>(context, listen: false);

      if (auth.token == null) return;

      await emergency.loadActive(auth.token!);

      if (!mounted) return;

      _listenForUpdates(auth.token!);
    });
  }

  /// The server puts this socket in the patient's own room from the JWT, so
  /// connecting as ourselves is all that is required to start receiving them.
  void _listenForUpdates(String token) {
    _socketService = SocketService();

    _socketService!.connect(token);

    _socketService!.on("emergency-status-updated", (data) {
      if (!mounted) return;

      Provider.of<EmergencyProvider>(context, listen: false)
          .applyLiveUpdate(EmergencyModel.fromJson(data));
    });
  }

  @override
  void dispose() {
    // Only this screen's event - the connection is shared with the queue screen.
    _socketService?.off("emergency-status-updated");
    super.dispose();
  }

  Future<void> _refresh() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.token == null) return;

    await Provider.of<EmergencyProvider>(context, listen: false)
        .loadActive(auth.token!);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: AppColors.white,
        title: const Text("Emergency status"),
      ),
      body: Consumer<EmergencyProvider>(
        builder: (context, provider, _) {
          final emergency = provider.active;

          if (provider.isLoading && emergency == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              // keep pull-to-refresh usable even when the content is short
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                if (provider.error != null) ...[
                  _errorBanner(provider.error!),
                  const SizedBox(height: 16),
                ],
                if (emergency == null)
                  _emptyState()
                else ...[
                  _headerCard(emergency),
                  const SizedBox(height: 20),
                  if (emergency.hasAmbulance) ...[
                    _ambulanceCard(emergency),
                    const SizedBox(height: 20),
                  ],
                  if (emergency.isCancelled)
                    _cancelledNotice()
                  else ...[
                    const Text(
                      "Progress",
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _stepper(emergency),
                  ],
                  if (emergency.canCancel) ...[
                    const SizedBox(height: 24),
                    _cancelButton(emergency, provider.isSubmitting),
                  ],
                  const SizedBox(height: 20),
                  if (!emergency.isClosed)
                    const Center(
                      child: Text(
                        "Pull down to refresh",
                        style: TextStyle(color: AppColors.grey, fontSize: 11),
                      ),
                    ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Color _statusColor(EmergencyModel emergency) {
    if (emergency.isCancelled) return AppColors.grey;
    if (emergency.isCompleted) return AppColors.success;
    return AppColors.error;
  }

  IconData _statusIcon(EmergencyModel emergency) {
    if (emergency.isCancelled) return Icons.cancel_outlined;
    if (emergency.isCompleted) return Icons.check_circle;
    return Icons.emergency_share;
  }

  /// Asks before calling the request off - the hospital may already have an
  /// ambulance rolling, and there is no way to un-cancel afterwards.
  Future<void> _confirmCancel(EmergencyModel emergency) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text(
          "Cancel this request?",
          style: TextStyle(color: AppColors.white, fontSize: 17),
        ),
        content: Text(
          emergency.hasAmbulance
              ? "An ambulance has already been assigned to you. Only cancel if you no longer need it."
              : "The hospital will be told you no longer need an ambulance. This cannot be undone.",
          style: const TextStyle(color: AppColors.grey, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text(
              "Keep it",
              style: TextStyle(color: AppColors.grey),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text(
              "Cancel request",
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final provider = Provider.of<EmergencyProvider>(context, listen: false);

    if (auth.token == null) return;

    final ok = await provider.cancelEmergency(
      token: auth.token!,
      emergencyId: emergency.id,
    );

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? "Emergency request cancelled"
              : provider.error ?? "Could not cancel the request",
        ),
        backgroundColor: ok ? AppColors.card : AppColors.error,
      ),
    );
  }

  Widget _cancelButton(EmergencyModel emergency, bool busy) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: OutlinedButton.icon(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error,
          side: const BorderSide(color: AppColors.error),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        onPressed: busy ? null : () => _confirmCancel(emergency),
        icon: busy
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.close, size: 18),
        label: Text(busy ? "Cancelling..." : "Cancel this request"),
      ),
    );
  }

  Widget _cancelledNotice() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: const [
          Icon(Icons.info_outline, color: AppColors.grey, size: 18),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              "You cancelled this request. You can raise a new emergency at any time.",
              style: TextStyle(color: AppColors.grey, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _errorBanner(String message) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.error),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.error, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: Column(
        children: const [
          Icon(Icons.check_circle_outline, color: AppColors.grey, size: 48),
          SizedBox(height: 16),
          Text(
            "No active emergency",
            style: TextStyle(color: AppColors.white, fontSize: 16),
          ),
          SizedBox(height: 6),
          Text(
            "You do not have an ongoing ambulance request.",
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.grey, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _headerCard(EmergencyModel emergency) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _statusColor(emergency)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(_statusIcon(emergency), color: _statusColor(emergency)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _stepLabels[emergency.status] ?? emergency.status,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _row(Icons.local_hospital, emergency.hospitalName ?? "Hospital"),
          if (emergency.hospitalPhone != null &&
              emergency.hospitalPhone!.isNotEmpty)
            _row(Icons.phone, emergency.hospitalPhone!),
          _row(
            Icons.medical_information,
            EmergencyReason.label(emergency.reason),
          ),
          if (emergency.message.isNotEmpty)
            _row(Icons.notes, emergency.message),
        ],
      ),
    );
  }

  Widget _ambulanceCard(EmergencyModel emergency) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primaryBlue),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.airport_shuttle, color: AppColors.primaryBlue),
              SizedBox(width: 10),
              Text(
                "Your ambulance",
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (emergency.ambulance.vehicleNumber.isNotEmpty)
            _row(Icons.directions_car, emergency.ambulance.vehicleNumber),
          if (emergency.ambulance.driverName.isNotEmpty)
            _row(Icons.person, emergency.ambulance.driverName),
          if (emergency.ambulance.driverPhone.isNotEmpty)
            _row(Icons.phone_in_talk, emergency.ambulance.driverPhone),
        ],
      ),
    );
  }

  Widget _row(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.grey, size: 15),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: AppColors.grey, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepper(EmergencyModel emergency) {
    final current = emergency.stepIndex;

    return Column(
      children: List.generate(EmergencyModel.statusFlow.length, (i) {
        final status = EmergencyModel.statusFlow[i];
        // current == -1 means an unknown status from the server; treat every
        // step as not-yet-reached rather than guessing.
        final done = current >= 0 && i <= current;
        final isCurrent = i == current;
        final isLast = i == EmergencyModel.statusFlow.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: done ? AppColors.primaryBlue : Colors.transparent,
                      border: Border.all(
                        color: done ? AppColors.primaryBlue : AppColors.border,
                        width: 2,
                      ),
                    ),
                    child: done
                        ? const Icon(Icons.check,
                            size: 11, color: AppColors.white)
                        : null,
                  ),
                  if (!isLast)
                    Expanded(
                      child: Container(
                        width: 2,
                        color: done ? AppColors.primaryBlue : AppColors.border,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 22),
                  child: Text(
                    _stepLabels[status] ?? status,
                    style: TextStyle(
                      color: done ? AppColors.white : AppColors.grey,
                      fontSize: 14,
                      fontWeight:
                          isCurrent ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
