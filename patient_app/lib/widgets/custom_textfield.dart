import 'package:flutter/material.dart';

class TextFieldWidget extends StatelessWidget {
  final String text;
  final TextEditingController controller;
  final bool filled;
  final int lines;
  final bool readOnly;
  const TextFieldWidget({
    super.key,
    required this.controller,
    required this.text,
    required this.filled,
    this.lines = 1,
    this.readOnly=false,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: lines,
      readOnly: readOnly,
      cursorColor: readOnly ? Colors.transparent : null,   // hide blinking cursor in view mode
      decoration: InputDecoration(
        filled: filled,
        fillColor: Colors.white,
        hintText: text,
        
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}
