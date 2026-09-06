import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/voice_assistant/provider/voice_assistant_provider.dart';
import 'package:patient_app/models/voice_message_model.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

class VoiceAssistantScreen extends StatefulWidget {
  const VoiceAssistantScreen({super.key});

  /// The provider is scoped to this route rather than registered globally in
  /// `main.dart`, so the microphone and audio player are released as soon as
  /// the patient leaves the screen.
  static Route<void> route() {
    return MaterialPageRoute(
      builder: (_) => ChangeNotifierProvider(
        create: (_) => VoiceAssistantProvider(),
        child: const VoiceAssistantScreen(),
      ),
    );
  }

  @override
  State<VoiceAssistantScreen> createState() => _VoiceAssistantScreenState();
}

class _VoiceAssistantScreenState extends State<VoiceAssistantScreen>
    with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();
  late final AnimationController _pulse;
  int _lastMessageCount = 0;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);

    // Resolved synchronously so no BuildContext crosses the async gap.
    final provider = context.read<VoiceAssistantProvider>();
    final patientId = context.read<AuthProvider>().patientId;
    Future.microtask(() => provider.init(patientId: patientId));
  }

  @override
  void dispose() {
    _pulse.dispose();
    _scrollController.dispose();
    _textController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  String _statusLabel(VoiceAssistantProvider p) {
    switch (p.status) {
      case VoiceStatus.waking:
        return "Waking the assistant...";
      case VoiceStatus.listening:
        return "Listening... speak now";
      case VoiceStatus.processing:
        return "MediReach is thinking...";
      case VoiceStatus.speaking:
        return "MediReach is speaking...";
      case VoiceStatus.error:
        return p.errorMessage ?? "Something went wrong";
      case VoiceStatus.idle:
        return p.conversationActive ? "Paused" : "Ready to start";
    }
  }

  Color _statusColor(VoiceStatus status) {
    switch (status) {
      case VoiceStatus.listening:
        return AppColors.success;
      case VoiceStatus.error:
        return AppColors.error;
      case VoiceStatus.speaking:
        return AppColors.glowBlue;
      default:
        return AppColors.grey;
    }
  }

  Future<void> _onMicPressed(VoiceAssistantProvider p) async {
    switch (p.status) {
      case VoiceStatus.listening:
        await p.stopAndSend();
        break;
      case VoiceStatus.speaking:
        await p.skipPlayback();
        break;
      case VoiceStatus.idle:
      case VoiceStatus.error:
        await p.startConversation();
        break;
      case VoiceStatus.waking:
      case VoiceStatus.processing:
        break; // busy
    }
  }

  void _submitText(VoiceAssistantProvider p) {
    final text = _textController.text;
    if (text.trim().isEmpty) return;
    _textController.clear();
    FocusScope.of(context).unfocus();
    p.sendTypedMessage(text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "AI Health Assistant",
              style: GoogleFonts.abel(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const Text(
              "Speak or type how you are feeling",
              style: TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: Consumer<VoiceAssistantProvider>(
        builder: (context, provider, _) {
          if (provider.messages.length != _lastMessageCount) {
            _lastMessageCount = provider.messages.length;
            WidgetsBinding.instance.addPostFrameCallback(
              (_) => _scrollToBottom(),
            );
          }

          return SafeArea(
            child: Column(
              children: [
                _statusBar(provider),
                Expanded(
                  child: provider.messages.isEmpty
                      ? _emptyState()
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                          itemCount: provider.messages.length,
                          itemBuilder: (_, i) => _bubble(provider.messages[i]),
                        ),
                ),
                _textInput(provider),
                _controls(provider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _statusBar(VoiceAssistantProvider provider) {
    final color = _statusColor(provider.status);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      color: AppColors.card,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              _statusLabel(provider),
              style: GoogleFonts.inter(fontSize: 12, color: color),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.graphic_eq,
              size: 56,
              color: AppColors.primaryBlue.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              "Ask MediReach anything",
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Tap the microphone and describe your symptoms, "
              "or type a message below.",
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.grey,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _bubble(VoiceMessage message) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primaryBlue : AppColors.card,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser ? null : Border.all(color: AppColors.border, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isUser ? "You" : "MediReach",
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isUser ? Colors.white70 : AppColors.glowBlue,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              message.text,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.white,
                height: 1.45,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _textInput(VoiceAssistantProvider provider) {
    final busy = provider.status == VoiceStatus.processing;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _textController,
              enabled: !busy,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _submitText(provider),
              decoration: InputDecoration(
                hintText: "Type a message instead...",
                hintStyle: GoogleFonts.inter(
                  color: AppColors.grey,
                  fontSize: 13,
                ),
                filled: true,
                fillColor: AppColors.card,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: const BorderSide(color: AppColors.primaryBlue),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: busy ? null : () => _submitText(provider),
            icon: const Icon(Icons.send_rounded),
            color: AppColors.primaryBlue,
          ),
        ],
      ),
    );
  }

  Widget _controls(VoiceAssistantProvider provider) {
    final busy = provider.status == VoiceStatus.processing ||
        provider.status == VoiceStatus.waking;
    final listening = provider.status == VoiceStatus.listening;
    final speaking = provider.status == VoiceStatus.speaking;

    IconData icon;
    if (listening) {
      icon = Icons.stop_rounded;
    } else if (speaking) {
      icon = Icons.skip_next_rounded;
    } else {
      icon = Icons.mic_rounded;
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 56,
            child: provider.conversationActive
                ? IconButton(
                    tooltip: "End conversation",
                    onPressed: provider.endConversation,
                    icon: const Icon(Icons.call_end_rounded),
                    color: AppColors.error,
                  )
                : null,
          ),
          AnimatedBuilder(
            animation: _pulse,
            builder: (context, child) {
              final glow = listening ? (8 + _pulse.value * 14) : 0.0;
              return Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    if (listening)
                      BoxShadow(
                        color: AppColors.glowBlue.withValues(alpha: 0.6),
                        blurRadius: glow,
                        spreadRadius: glow / 3,
                      ),
                  ],
                ),
                child: child,
              );
            },
            child: GestureDetector(
              onTap: busy ? null : () => _onMicPressed(provider),
              child: CircleAvatar(
                radius: 34,
                backgroundColor: busy
                    ? AppColors.border
                    : (listening ? AppColors.error : AppColors.primaryBlue),
                child: busy
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Icon(icon, color: Colors.white, size: 30),
              ),
            ),
          ),
          const SizedBox(width: 56),
        ],
      ),
    );
  }
}
