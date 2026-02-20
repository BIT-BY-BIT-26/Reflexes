import 'package:flutter/material.dart';
import 'package:patient_app/features/appointment/provider/appointment_provider.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:provider/provider.dart';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {

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
    return Scaffold(
      appBar: AppBar(title: Center(child: const Text("My Appointments"))),
      body: Consumer<AppointmentProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.appointments.isEmpty) {
            return const Center(child: Text("No appointments found"));
          }

          return ListView.builder(
            itemCount: provider.appointments.length,
            itemBuilder: (context, index) {
              final appt = provider.appointments[index];

              return Card(
                margin: const EdgeInsets.all(10),
                child: ListTile(
                  title: Text(
                    appt.doctorName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Department: ${appt.departmentName}"),
                      Text("Hospital: ${appt.hospitalName}"),
                      
                      Text(
                        appt.appointmentType == "online"
                            ? "Type: Online Consultation"
                            : "Type: Offline Consultation",
                        style: TextStyle(
                          color: appt.appointmentType == "online"
                              ? Colors.deepPurple
                              : Colors.blue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),

                      if (appt.appointmentType == "offline")
                        Text(
                          appt.token != null
                              ? "Token No: ${appt.token}"
                              : "Token No: Not assigned",
                        ),
                      Text(
                        "Status: ${appt.status}",
                        style: TextStyle(
                          color: appt.status == "CONFIRMED"
                              ? Colors.green
                              : Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (appt.appointmentType == "online") ...[
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.deepPurple,
                            ),
                            onPressed: () async {
                              // final token = context.read<AuthProvider>().token!;
                              
                              // final roomId = await ConsultationService.getRoomId(
                              //   appointmentId: appt.id,
                              //   token: token,
                              // );

                              // if (roomId == null) {
                              //   ScaffoldMessenger.of(context).showSnackBar(
                              //     SnackBar(content: Text("Consultation not ready yet")),
                              //   );
                              //   return;
                              // }

                              // Navigator.push(
                              //   context,
                              //   MaterialPageRoute(
                              //     builder: (_) => VideoCallScreen(roomId: roomId),
                              //   ),
                              // );
                            },
                            child: const Text("Join call"),
                          )
                      ],
                      if (appt.status == "CONFIRMED") ...[
                        if (appt.appointmentType == "offline")
                          ElevatedButton(
                            onPressed: () {
                              // Navigator.push(
                              //   context,
                              //   MaterialPageRoute(
                              //     builder: (_) => PrescriptionScreen(
                              //       appointmentId: appt.id,
                              //       token: context.read<AuthProvider>().token!,
                              //     ),
                              //   ),
                              // );
                            },
                            child: const Text("View Prescription"),
                          ),
                      ]       
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
