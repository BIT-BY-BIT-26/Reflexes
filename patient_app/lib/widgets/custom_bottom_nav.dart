import 'package:flutter/material.dart';
import 'package:patient_app/features/appointment/booked_appointment_screen.dart';
import 'package:patient_app/features/home/home_screen.dart';
import 'package:patient_app/features/profile/profile_screen.dart';
import 'package:patient_app/features/queue/queue_screen.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:sliding_clipped_nav_bar/sliding_clipped_nav_bar.dart';

class CustomBottomNav extends StatefulWidget {
  const CustomBottomNav({super.key});

  @override
  State<CustomBottomNav> createState() => _CustomBottomNavState();
}

class _CustomBottomNavState extends State<CustomBottomNav> {
  int selectedIndex = 0;

  final PageController controller = PageController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: controller,
        physics: const NeverScrollableScrollPhysics(),
        children: const [
          HomeScreen(),
          MyAppointmentsScreen(),
          QueueScreen(),
          PatientProfileScreen(),
        ],
      ),

      bottomNavigationBar: SlidingClippedNavBar.colorful(
        backgroundColor: AppColors.background,

        selectedIndex: selectedIndex,

        iconSize: 28,

        onButtonPressed: (index) {
          setState(() {
            selectedIndex = index;
          });

          controller.animateToPage(
            index,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
          );
        },

        barItems: [
          BarItem(
            icon: Icons.home_rounded,
            title: 'Home',
            activeColor: Color.fromARGB(255, 21, 146, 230),
            inactiveColor: Colors.grey,
          ),
          BarItem(
            icon: Icons.calendar_month_rounded,
            title: 'Appointments',
            activeColor: Color.fromARGB(255, 21, 146, 230),
            inactiveColor: Colors.grey,
          ),
          BarItem(
            icon: Icons.groups_rounded,
            title: 'Queue',
            activeColor: Color.fromARGB(255, 21, 146, 230),
            inactiveColor: Colors.grey,
          ),
          BarItem(
            icon: Icons.person_rounded,
            title: 'Profile',
            activeColor: Color.fromARGB(255, 21, 146, 230),
            inactiveColor: Colors.grey,
          ),
        ],
      ),
    );
  }
}