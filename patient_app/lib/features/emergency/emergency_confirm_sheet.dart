import 'package:flutter/material.dart';
import 'package:patient_app/models/emergency_model.dart';
import 'package:patient_app/models/hospital_model.dart';
import 'package:patient_app/utils/constants.dart';

/// What the user settled on in the sheet. Null when they backed out.
class EmergencyRequestDraft {
  final Hospital hospital;
  final String reason;
  final String message;

  EmergencyRequestDraft({
    required this.hospital,
    required this.reason,
    required this.message,
  });
}

/// Confirmation step between tapping "Emergency" and actually filing the
/// request. It is deliberate: the backend has no CANCELLED status and the
/// transition table is strictly linear, so a request sent by mistake cannot be
/// withdrawn - the patient stays locked out by the duplicate guard until a
/// hospital admin walks it all the way to COMPLETED.
class EmergencyConfirmSheet extends StatefulWidget {
  /// Nearby hospitals, nearest first (the backend $geoNear already sorts them).
  final List<Hospital> hospitals;

  const EmergencyConfirmSheet({super.key, required this.hospitals});

  static Future<EmergencyRequestDraft?> show(
    BuildContext context,
    List<Hospital> hospitals,
  ) {
    return showModalBottomSheet<EmergencyRequestDraft>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => EmergencyConfirmSheet(hospitals: hospitals),
    );
  }

  @override
  State<EmergencyConfirmSheet> createState() => _EmergencyConfirmSheetState();
}

class _EmergencyConfirmSheetState extends State<EmergencyConfirmSheet> {
  late Hospital _selected;
  String _reason = "OTHER";
  bool _changingHospital = false;
  final TextEditingController _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selected = widget.hospitals.first;
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        // keep the confirm button above the keyboard
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            Row(
              children: const [
                Icon(Icons.emergency_share, color: AppColors.error),
                SizedBox(width: 10),
                Text(
                  "Request an ambulance",
                  style: TextStyle(
                    color: AppColors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              "Your location will be shared with the hospital.",
              style: TextStyle(color: AppColors.grey, fontSize: 12),
            ),
            const SizedBox(height: 20),

            _label("Hospital"),
            const SizedBox(height: 8),
            _hospitalCard(),

            if (_changingHospital) ...[
              const SizedBox(height: 10),
              _hospitalPicker(),
            ],

            const SizedBox(height: 20),
            _label("What is wrong?"),
            const SizedBox(height: 8),
            _reasonDropdown(),

            const SizedBox(height: 20),
            _label("Anything else? (optional)"),
            const SizedBox(height: 8),
            _messageField(),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.error,
                  foregroundColor: AppColors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  Navigator.pop(
                    context,
                    EmergencyRequestDraft(
                      hospital: _selected,
                      reason: _reason,
                      message: _messageController.text.trim(),
                    ),
                  );
                },
                icon: const Icon(Icons.local_hospital),
                label: const Text(
                  "Send emergency request",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  "Cancel",
                  style: TextStyle(color: AppColors.grey),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Text(
        text,
        style: const TextStyle(
          color: AppColors.white,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      );

  Widget _hospitalCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.local_hospital, color: AppColors.primaryBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selected.name,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _selected.distanceKm != null
                      ? "${_selected.distanceKm!.toStringAsFixed(1)} km away"
                      : _selected.city,
                  style: const TextStyle(color: AppColors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          if (widget.hospitals.length > 1)
            TextButton(
              onPressed: () =>
                  setState(() => _changingHospital = !_changingHospital),
              child: Text(
                _changingHospital ? "Close" : "Change",
                style: const TextStyle(color: AppColors.primaryBlue),
              ),
            ),
        ],
      ),
    );
  }

  Widget _hospitalPicker() {
    return Container(
      constraints: const BoxConstraints(maxHeight: 200),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: ListView.builder(
        shrinkWrap: true,
        itemCount: widget.hospitals.length,
        itemBuilder: (_, i) {
          final hospital = widget.hospitals[i];
          final selected = hospital.id == _selected.id;

          return ListTile(
            dense: true,
            title: Text(
              hospital.name,
              style: const TextStyle(color: AppColors.white, fontSize: 14),
            ),
            subtitle: Text(
              hospital.distanceKm != null
                  ? "${hospital.distanceKm!.toStringAsFixed(1)} km away"
                  : hospital.city,
              style: const TextStyle(color: AppColors.grey, fontSize: 11),
            ),
            trailing: selected
                ? const Icon(Icons.check_circle,
                    color: AppColors.primaryBlue, size: 18)
                : null,
            onTap: () => setState(() {
              _selected = hospital;
              _changingHospital = false;
            }),
          );
        },
      ),
    );
  }

  Widget _reasonDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _reason,
          isExpanded: true,
          dropdownColor: AppColors.card,
          style: const TextStyle(color: AppColors.white, fontSize: 14),
          items: EmergencyReason.labels.entries
              .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
              .toList(),
          onChanged: (value) {
            if (value != null) setState(() => _reason = value);
          },
        ),
      ),
    );
  }

  Widget _messageField() {
    return TextField(
      controller: _messageController,
      maxLines: 2,
      style: const TextStyle(color: AppColors.white, fontSize: 14),
      decoration: InputDecoration(
        hintText: "e.g. patient is conscious but bleeding",
        hintStyle: const TextStyle(color: AppColors.grey, fontSize: 13),
        filled: true,
        fillColor: AppColors.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryBlue),
        ),
      ),
    );
  }
}
