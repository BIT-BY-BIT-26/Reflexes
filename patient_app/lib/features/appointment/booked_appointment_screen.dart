import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/appointment/components/appointment_card.dart';
import 'package:patient_app/features/appointment/provider/appointment_provider.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/models/appointment_model.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';
// import 'package:patient_app/features/appointment/provider/appointment_provider.dart';
// import 'package:patient_app/features/auth/provider/auth_provider.dart';
// import 'package:provider/provider.dart';

// class MyAppointmentsScreen extends StatefulWidget {
//   const MyAppointmentsScreen({super.key});

//   @override
//   State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
// }

// class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {

//   @override
//   void initState() {
//     super.initState();

//     Future.microtask(() {
//       final token = context.read<AuthProvider>().token;

//       if (token != null) {
//         context.read<AppointmentProvider>().fetchMyAppointments(token);
//       }
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: Center(child: const Text("My Appointments"))),
//       body: Consumer<AppointmentProvider>(
//         builder: (context, provider, _) {
//           if (provider.isLoading) {
//             return const Center(child: CircularProgressIndicator());
//           }

//           if (provider.appointments.isEmpty) {
//             return const Center(child: Text("No appointments found"));
//           }

//           return ListView.builder(
//             itemCount: provider.appointments.length,
//             itemBuilder: (context, index) {
//               final appt = provider.appointments[index];

//               return Card(
//                 margin: const EdgeInsets.all(10),
//                 child: ListTile(
//                   title: Text(
//                     appt.doctorName,
//                     style: const TextStyle(fontWeight: FontWeight.bold),
//                   ),
//                   subtitle: Column(
//                     crossAxisAlignment: CrossAxisAlignment.start,
//                     children: [
//                       Text("Department: ${appt.departmentName}"),
//                       Text("Hospital: ${appt.hospitalName}"),
                      
//                       Text(
//                         appt.appointmentType == "online"
//                             ? "Type: Online Consultation"
//                             : "Type: Offline Consultation",
//                         style: TextStyle(
//                           color: appt.appointmentType == "online"
//                               ? Colors.deepPurple
//                               : Colors.blue,
//                           fontWeight: FontWeight.w600,
//                         ),
//                       ),

//                       if (appt.appointmentType == "offline")
//                         Text(
//                           appt.token != null
//                               ? "Token No: ${appt.token}"
//                               : "Token No: Not assigned",
//                         ),
//                       Text(
//                         "Status: ${appt.status}",
//                         style: TextStyle(
//                           color: appt.status == "CONFIRMED"
//                               ? Colors.green
//                               : Colors.orange,
//                           fontWeight: FontWeight.w600,
//                         ),
//                       ),
//                       if (appt.appointmentType == "online") ...[
//                           ElevatedButton(
//                             style: ElevatedButton.styleFrom(
//                               backgroundColor: Colors.deepPurple,
//                             ),
//                             onPressed: () async {
//                               // final token = context.read<AuthProvider>().token!;
                              
//                               // final roomId = await ConsultationService.getRoomId(
//                               //   appointmentId: appt.id,
//                               //   token: token,
//                               // );

//                               // if (roomId == null) {
//                               //   ScaffoldMessenger.of(context).showSnackBar(
//                               //     SnackBar(content: Text("Consultation not ready yet")),
//                               //   );
//                               //   return;
//                               // }

//                               // Navigator.push(
//                               //   context,
//                               //   MaterialPageRoute(
//                               //     builder: (_) => VideoCallScreen(roomId: roomId),
//                               //   ),
//                               // );
//                             },
//                             child: const Text("Join call"),
//                           )
//                       ],
//                       if (appt.status == "CONFIRMED") ...[
//                         if (appt.appointmentType == "offline")
//                           ElevatedButton(
//                             onPressed: () {
//                               // Navigator.push(
//                               //   context,
//                               //   MaterialPageRoute(
//                               //     builder: (_) => PrescriptionScreen(
//                               //       appointmentId: appt.id,
//                               //       token: context.read<AuthProvider>().token!,
//                               //     ),
//                               //   ),
//                               // );
//                             },
//                             child: const Text("View Prescription"),
//                           ),
//                       ]       
//                     ],
//                   ),
//                 ),
//               );
//             },
//           );
//         },
//       ),
//     );
//   }
// }

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {
  bool isUpcoming = true;
  

  List<AppointmentModel> getUpcomingAppointments(
    List<AppointmentModel> appointments) {

    final today = DateTime.now();

    return appointments.where((appointment) {

      final appointmentDate = DateTime(
        appointment.date.year,
        appointment.date.month,
        appointment.date.day,
      );

      final currentDate = DateTime(
        today.year,
        today.month,
        today.day,
      );

      return (appointmentDate.isAtSameMomentAs(currentDate) ||
              appointmentDate.isAfter(currentDate)) &&
          appointment.status != "COMPLETED";
    }).toList();
  }

  List<AppointmentModel> getPastAppointments(
      List<AppointmentModel> appointments) {

    final today = DateTime.now();

    return appointments.where((appointment) {

      final appointmentDate = DateTime(
        appointment.date.year,
        appointment.date.month,
        appointment.date.day,
      );

      final currentDate = DateTime(
        today.year,
        today.month,
        today.day,
      );

      return appointmentDate.isBefore(currentDate) ||
          appointment.status == "COMPLETED";
    }).toList();
  }
  
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final token = context.read<AuthProvider>().token;
      if (token != null) {
        context.read<AppointmentProvider>().fetchMyAppointments(token);
      }
    });
  }

  @override
  Widget build(BuildContext context) {

    final provider = Provider.of<AppointmentProvider>(context);
    final appointments = provider.appointments;
    print("Appointments Count = ${provider.appointments.length}");
    final filteredAppointments = isUpcoming
        ? getUpcomingAppointments(appointments)
        : getPastAppointments(appointments);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 0, 0, 0),
        elevation: 0,
        title:  Text(
          "My Appointments",
          style: GoogleFonts.poppins(
            color: Colors.white,
          ),
        ),
      ),
      body: Column(
        children: [

          const SizedBox(height: 16),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isUpcoming = true;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isUpcoming
                              ? Colors.blue
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child:  Center(
                          child: Text("Upcoming",
                          style:GoogleFonts.inter(
                            color:Colors.white
                          )
                          ),
                        ),
                      ),
                    ),
                  ),

                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isUpcoming = false;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: !isUpcoming
                              ? Colors.blue
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child:  Center(
                          child: Text("Past",
                          style:GoogleFonts.inter(
                            color:Colors.white
                          )
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          
          Expanded(
            child: filteredAppointments.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.calendar_month_outlined,
                          size: 70,
                          color: Colors.white38,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          isUpcoming
                              ? "No upcoming appointments"
                              : "No past appointments",
                          style: GoogleFonts.inter(
                            color: Colors.white70,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredAppointments.length,
                    itemBuilder: (context, index) {
                      return AppointmentCard(
                        appointment: filteredAppointments[index],
                        isPast: !isUpcoming,
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}
