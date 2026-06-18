import 'package:flutter/material.dart';
import 'package:patient_app/features/appointment/booked_appointment_screen.dart';
import 'package:patient_app/features/hospitals/hospital_screen.dart';
import 'package:patient_app/features/profile/profile_screen.dart';
import 'package:patient_app/features/queue/queue_screen.dart';



class CustomBottomNav extends StatefulWidget {
  const CustomBottomNav({super.key});

  @override
  _CustomBottomNavState createState() => _CustomBottomNavState();
}

class _CustomBottomNavState extends State<CustomBottomNav> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
  HospitalScreen(), MyAppointmentsScreen(),QueueScreen(), PatientProfileScreen()
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],

      bottomNavigationBar: BottomAppBar(
        height: 61,
        color:const Color.fromARGB(255, 255, 255, 255),
        shape: CircularNotchedRectangle(), // notch for FAB
        notchMargin:4.0,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            IconButton(
              icon: Icon(Icons.business_outlined,size: 35,),
              color:_selectedIndex==0?Colors.blueAccent:Colors.grey,
              onPressed: () => _onItemTapped(0),
            ),
            IconButton(
              icon: Icon(Icons.history,size: 35,),
              color:_selectedIndex==1?Colors.blueAccent:Colors.grey,
              onPressed: () => _onItemTapped(1),
            ),
            IconButton(
              icon: Icon(Icons.groups,size: 35,),
              color:_selectedIndex==2?Colors.blueAccent:Colors.grey,
              onPressed: () => _onItemTapped(2),
            ),
            IconButton(
              icon: Icon(Icons.person,size: 35,),
              color:_selectedIndex==3?Colors.blueAccent:Colors.grey,
              onPressed: () => _onItemTapped(3),
            ),
            
          ],
        ),
      ),
    );
  }
}
