import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:patient_app/features/home/components/circular_icon.dart';
import 'package:patient_app/utils/constants.dart';

class QuickAccessCard extends StatelessWidget {
  final double size;
  final FaIconData iconPath;
  final String text;
  const QuickAccessCard({super.key, required this.size, required this.iconPath, required this.text});

  @override
  Widget build(BuildContext context) {
    return  SizedBox(
      width: 100,
      height: 100,
      child: Card(
        
        color: const Color.fromARGB(255, 12, 17, 26),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(
            color: Colors.grey,
            width: 0.4,
          ),
        ),
        child:Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              RoundedIcons(iconPath:iconPath , size: size),
              SizedBox(height: 8),
              Text(
                text,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        )
      ),
    );
  }
}