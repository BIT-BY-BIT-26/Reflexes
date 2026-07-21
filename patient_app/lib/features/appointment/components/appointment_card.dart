import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:patient_app/models/appointment_model.dart';
import 'package:patient_app/utils/constants.dart';

class AppointmentCard extends StatelessWidget {
  final bool isPast;
  final AppointmentModel appointment;

  const AppointmentCard({
    super.key,
    required this.isPast,
    required this.appointment
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = getStatusColor(appointment.status);
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
      child: Row(
        children: [
          appointment.doctorProfilePhoto.isNotEmpty
          ? ClipOval(
              child: CachedNetworkImage(
                imageUrl: appointment.doctorProfilePhoto,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
              ),
            )
          :  CircleAvatar(
            backgroundColor:  const Color.fromARGB(255, 21, 87, 230).withAlpha(40),
              radius: 28,
              child: FaIcon(
                FontAwesomeIcons.userDoctor,
                size: 30,
                color:const Color.fromARGB(255, 21, 146, 230),
              ),
            ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [

                Row(
                  children: [
                    Expanded(
                      child: Text(
                        appointment.doctorName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        appointment.status,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 4),

                Text(
                  appointment.departmentName,
                  style: TextStyle(
                    color: Colors.grey.shade400,
                  ),
                ),

                const SizedBox(height: 4),

                Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 16,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 6),

                    Expanded(
                      child: Text(
                        appointment.hospitalName,
                        style: TextStyle(
                          color: Colors.grey.shade400,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(
                            Icons.access_time,
                            size: 16,
                            color: Colors.grey,
                          ),
                          const SizedBox(width: 6),
                      
                          Text(
                            "10:30 AM",
                            style: TextStyle(
                              color: Colors.grey.shade400,
                            ),
                          ),

                        ],
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_outlined,
                          size: 16,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 6),
                    
                        Text(
                          DateFormat('dd MMM yyyy').format(appointment.date),
                          style: TextStyle(
                            color: Colors.grey.shade400,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          IconButton(
            onPressed: () {
              // navigate details
            },
            icon: const Icon(
              Icons.arrow_forward_ios,
              color: Colors.white,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }
}

Color getStatusColor(String status) {
  switch (status) {
    case "CONFIRMED":
      return Colors.green;

    case "CURRENT":
      return Colors.orange;

    case "COMPLETED":
      return Colors.blue;

    case "CANCELLED":
      return Colors.red;

    case "SKIPPED":
      return Colors.amber;

    default:
      return Colors.grey;
  }
}