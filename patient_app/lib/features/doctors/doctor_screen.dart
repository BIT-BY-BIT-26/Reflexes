import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/appointment/provider/appointment_provider.dart';
import 'package:patient_app/features/appointment/service/book_appointemt_service.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/doctors/provider/doctor_provider.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

class DoctorListScreen extends StatefulWidget {
  final String hospitalId;
  final String departmentId;
  //final String token;

  const DoctorListScreen({
    super.key,
    required this.hospitalId,
    required this.departmentId,
    //required this.token,
  });

  @override
  State<DoctorListScreen> createState() => _DoctorListScreenState();
}

class _DoctorListScreenState extends State<DoctorListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<DoctorProvider>().loadDoctors(
        hospitalId: widget.hospitalId,
        departmentId: widget.departmentId,
        //token: widget.token,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DoctorProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor:Colors.black,title:  Text("Doctors",style: GoogleFonts.poppins(color: Colors.white),)),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.doctors.isEmpty
          ? const Center(child: Text("No doctors found"))
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: provider.doctors.length,
              itemBuilder: (context, index) {
                final doctor = provider.doctors[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                  gradient: 
                    const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        
                        Color(0xFF161D2B),
                        Color(0xFF0E1522),
                        Color.fromARGB(255, 12, 17, 26),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.08),
                    ),
                  ),
                  child: Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  //mainAxisAlignment: MainAxisAlignment.center,
  children: [
    Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      //mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const CircleAvatar(
          radius: 28,
          backgroundColor: Color(0xFF27364D),
          child: Icon(
            Icons.person,
            color: Colors.white,
            size: 28,
          ),
        ),
    
        const SizedBox(width: 14),
    
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                doctor.name,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
    
              const SizedBox(height: 4),
    
              Text(
                doctor.position,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: Colors.blue.shade200,
                ),
              ),
    
              const SizedBox(height: 12),
    
              Row(
                children: [
                  const Icon(
                    Icons.local_hospital,
                    color: Colors.white70,
                    size: 17,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      doctor.hospitalName,
                      style: GoogleFonts.poppins(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
    
              const SizedBox(height: 8),
    
              Row(
                children: [
                  const Icon(
                    Icons.work_outline,
                    color: Colors.white70,
                    size: 17,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    "${doctor.experience} Years Experience",
                    style: GoogleFonts.poppins(
                      color: Colors.white70,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
    
        const Icon(
          Icons.arrow_forward_ios,
          color: Colors.white54,
          size: 16,
        ),
      ],
    ),

    const SizedBox(height: 18),

    Row(
      children: [
        Expanded(
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () {
              _bookAppointment(
                context,
                doctor.id,
                "offline",
              );
            },
            child: const Text("Book Offline"),
          ),
        ),

        const SizedBox(width: 12),

        Expanded(
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.deepPurple,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () {
              _bookAppointment(
                context,
                doctor.id,
                "online",
              );
            },
            child: const Text("Book Online"),
          ),
        ),
      ],
    ),
  ],
),
                  // child: ListTile(
                  //   leading: const CircleAvatar(child: Icon(Icons.person)),
                  //   title: Text(
                  //     doctor.name,
                  //     style: const TextStyle(fontWeight: FontWeight.w600),
                  //   ),
                  //   subtitle: Column(
                  //     crossAxisAlignment: CrossAxisAlignment.start,
                  //     children: [
                  //       Text(doctor.position),
                  //       const SizedBox(height: 4),
                  //       Text(
                  //         "Hospital: ${doctor.hospitalName}",
                  //         style: const TextStyle(fontSize: 12),
                  //       ),
                  //       Text(
                  //         "Experience: ${doctor.experience} years",
                  //         style: const TextStyle(fontSize: 12),
                  //       ),
                  //       // =====================
                  //       // BOOK APPOINTMENT BUTTON
                  //       // =====================
                  //       Padding(
                  //         padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  //         child: SizedBox(
                  //           width: double.infinity,
                  //           child: Row(
                  //             children: [
                  //               Expanded(
                  //                 child: ElevatedButton(
                  //                   onPressed: () {
                  //                     _bookAppointment(
                  //                       context,
                  //                       doctor.id,
                  //                       "offline",
                  //                     );
                  //                   },
                  //                   child: const Text("Book Offline"),
                  //                 ),
                  //               ),
                  //               const SizedBox(width: 8),
                  //               Expanded(
                  //                 child: ElevatedButton(
                  //                   style: ElevatedButton.styleFrom(
                  //                     backgroundColor: Colors.deepPurple,
                  //                   ),
                  //                   onPressed: () {
                  //                     _bookAppointment(
                  //                       context,
                  //                       doctor.id,
                  //                       "online",
                  //                     );
                  //                   },
                  //                   child: const Text("Book Online"),
                  //                 ),
                  //               ),
                  //             ],
                  //           ),
                  //         ),
                  //       ),
                  //     ],
                  //   ),
                  //   trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  // ),
                );
              },
            ),
    );
  }

  Future<void> _bookAppointment(BuildContext context, String doctorId,  String appointmentType,) async {
    try {
      final auth = context.read<AuthProvider>();
      final token = auth.token;

      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Please login first"),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final pickedDate = await showDatePicker(
        context: context,
        initialDate: DateTime.now(),
        firstDate: DateTime.now(),
        lastDate: DateTime.now().add(const Duration(days: 365)),
      );
      if (pickedDate == null) return;

      final pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );
      if (pickedTime == null) return;

      final appointmentDate = DateTime(
        pickedDate.year,
        pickedDate.month,
        pickedDate.day,
        pickedTime.hour,
        pickedTime.minute,
      );

      final res = await AppointmentService.createAppointment(
        doctorId: doctorId,
        date: appointmentDate.toIso8601String(),
        token: token,
        appointmentType: appointmentType
      );

      if (!context.mounted) return;

      // ✅ Snackbar
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? "Appointment booked"),
          backgroundColor: Colors.green,
        ),
      );

      // ✅ REFRESH MY APPOINTMENTS
      await context.read<AppointmentProvider>().fetchMyAppointments(token);

      // ✅ REDIRECT TO MY APPOINTMENTS TAB
      Navigator.pop(context); // Doctor list se bahar
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  }
}
