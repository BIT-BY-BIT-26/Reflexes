import 'package:flutter/material.dart';

class CustomText extends StatelessWidget {
  final double fontSize;
  final String text;
  final Color color;
  const CustomText({super.key,required this.fontSize,required this.color,required this.text});

  @override
  Widget build(BuildContext context) {
    return Text(text,style: TextStyle(fontSize: fontSize,color: color),);
  }
}
