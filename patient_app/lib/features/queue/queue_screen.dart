import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/queue/provider/queue_provider.dart';
import 'package:patient_app/features/teleconsultation/videocall_screen.dart';
import 'package:patient_app/features/video_call.dart';
import 'package:patient_app/socket.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

class QueueScreen extends StatefulWidget {
  const QueueScreen({super.key});

  @override
  State<QueueScreen> createState() => _QueueScreenState();
}

class _QueueScreenState extends State<QueueScreen> {

  SocketService? socketService; 
  void _showIncomingCallDialog(
  Map<String, dynamic> data,
) {
  if (!mounted) return;

  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) {
      return AlertDialog(
        title: const Text(
          "Incoming Video Call",
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.videocam,
              size: 60,
              color: Colors.blue,
            ),
            SizedBox(height: 20),
            Text(
              "Doctor is calling you",
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Reject
              Navigator.pop(context);

              print("❌ CALL REJECTED");
            },
            child: const Text(
              "Reject",
              style: TextStyle(
                color: Colors.red,
              ),
            ),
          ),

          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);

              print("✅ CALL ACCEPTED");

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VideoCall(
                    callerSocketId: data["callerSocketId"],
                    offer: data["offer"],
                  ),
                ),
              );
            },
            child: const Text("Accept"),
          ),
        ],
      );
    },
  );
}
  

@override
void initState() {
  super.initState();

  Future.microtask(() async {
    final queueProvider = Provider.of<QueueProvider>(
      context,
      listen: false,
    );

    final authProvider = Provider.of<AuthProvider>(
      context,
      listen: false,
    );

    final token = authProvider.token;

    if (token == null) {
      print("❌ No auth token available");
      return;
    }

    await queueProvider.loadQueue(token);

    final queue = queueProvider.queue;

    if (queue == null || !queue.hasActiveQueue) {
      print("ℹ️ No active queue");
      return;
    }

    // 👇 Patient ID
    final patientId = authProvider.patientId;

    if (patientId == null) {
      print("❌ Patient ID is null");
      return;
    }

    _connectPatientSocket(
      patientId,
      token,
    );
  });
}

void _connectPatientSocket(
  String patientId,
  String token,
) {
  socketService = SocketService();

  socketService!.connectPatient(
    baseUrl: socketUrl,
    token: token,
    patientId: patientId,

    onQueueUpdate: (data) {
      final queueProvider = Provider.of<QueueProvider>(
        context,
        listen: false,
      );

      final currentToken = data["currentToken"];

      if (currentToken != null) {
        queueProvider.updateCurrentToken(currentToken);
      }
    },

    onPaused: (data) {
      Provider.of<QueueProvider>(
        context,
        listen: false,
      ).pauseQueue();
    },
    onIncomingCall: (data) {
    _showIncomingCallDialog(data);
  },

    onResumed: (data) {
      final queueProvider = Provider.of<QueueProvider>(
        context,
        listen: false,
      );

      final currentToken = data["currentToken"] ?? 0;

      queueProvider.resumeQueue(currentToken);
    },

    onStopped: (data) {
      Provider.of<QueueProvider>(
        context,
        listen: false,
      ).stopQueue();
    },
  );
}
  
  @override
  void dispose() {
    socketService?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final queueProvider =context.watch<QueueProvider>();
    final queue = queueProvider.queue;
    
    if (queueProvider.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (queue == null || !queue.hasActiveQueue) {
      return Scaffold(
        backgroundColor: const Color(0xFF020617),
        body: Center(
          child: Column(
            mainAxisAlignment:
                MainAxisAlignment.center,
            children: const [

              Icon(
                Icons.event_busy,
                color: Colors.white54,
                size: 80,
              ),

              SizedBox(height: 20),

              Text(
                "No Active Queue For Today",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }
    final currentToken =queue.currentToken ?? 0;
    final yourToken =queue.yourToken ?? 0;
    final patientsAhead =queue.patientsAhead ?? 0;
    final isPaused =queue.isPaused ?? false;
    final isOpdClosed =queue.isOpdClosed ?? false;
    final consultationNotStarted = currentToken == 0 &&!isPaused &&!isOpdClosed;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF000B29),
              Color(0xFF020617),
            ],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _buildHeader(),
              const SizedBox(height: 20),

              _buildDoctorCard(
                queue.doctorName ?? "",
                queue.department ?? "",
              ),

              const SizedBox(height: 20),
              if(consultationNotStarted)
                _buildUpcomingCard(yourToken)

              else ...[
                _buildCurrentTokenCard(
                  currentToken,
                  yourToken
                ),

                const SizedBox(height:20),

                _buildStatsRow(
                  yourToken,
                  patientsAhead,
                ),

                const SizedBox(height: 20),

                _buildProgressCard(
                  currentToken,
                  yourToken,
                ),

                const SizedBox(height: 20),

                _buildWaitTimeCard(),

              ],

              const SizedBox(height:20),

              _buildNotificationCard(
                queue.notification
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Queue Status",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 4),
              Text(
                "Live consultation updates",
                style: TextStyle(
                  color: Colors.white54,
                ),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: Colors.green,
            borderRadius: BorderRadius.circular(50),
          ),
          child: const Text(
            "LIVE",
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        )
      ],
    );
  }

  Widget _buildDoctorCard(
    String doctor,
    String department,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius:
            BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [

          Text(
            doctor,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            department,
            style: const TextStyle(
              color: Colors.white54,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildUpcomingCard(
    int yourToken,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius:
            BorderRadius.circular(20),
      ),
      child: Column(
        children: [

          const Text(
            "YOUR TOKEN",
            style: TextStyle(
              color: Colors.white54,
            ),
          ),

          const SizedBox(height: 12),

          Text(
            "$yourToken",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 50,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentTokenCard(
    int currentToken,
    int yourToken,
  ) {
    final isMyTurn = currentToken == yourToken;

    return Container(
      height: 240,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF2563EB),
            Color(0xFF1D4ED8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x801D4ED8),
            blurRadius: 30,
            spreadRadius: -10,
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -40,
            top: -40,
            child: Container(
              height: 150,
              width: 150,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(.08),
                shape: BoxShape.circle,
              ),
            ),
          ),

          Positioned(
            left: -30,
            bottom: -30,
            child: Container(
              height: 100,
              width: 100,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(.05),
                shape: BoxShape.circle,
              ),
            ),
          ),

          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  isMyTurn
                      ? "IT'S YOUR TURN"
                      : "CURRENT TOKEN",
                  style: const TextStyle(
                    color: Colors.white70,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const SizedBox(height: 12),

                Text(
                  "$currentToken",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 80,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                if (isMyTurn)
                  const Text(
                    "Please proceed to the doctor's room",
                    style: TextStyle(
                      color: Colors.white,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(
    int yourToken,
    int patientsAhead,
  ) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            icon: Icons.confirmation_number_rounded,
            title: "Your Token",
            value: "#$yourToken",
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            icon: Icons.people_alt_rounded,
            title: "Ahead",
            value: "$patientsAhead",
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: const Color(0xFF60A5FA),
            size: 30,
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 30,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressCard(
    int currentToken,
    int yourToken,
  ) {
    double progress =
        yourToken == 0 ? 0 : currentToken / yourToken;

    if (progress > 1) {
      progress = 1;
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: [
          const Text(
            "Queue Progress",
            style: TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),

          const SizedBox(height: 20),

          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 130,
                height: 130,
                child: CircularProgressIndicator(
                  value: progress,
                  strokeWidth: 10,
                  backgroundColor: Colors.white10,
                ),
              ),

              Text(
                "${(progress * 100).toInt()}%",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildNotificationCard( String message) {
  return Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: const Color(0xFF0F172A),
      borderRadius:
          BorderRadius.circular(20),
    ),
    child: Row(
      children: [

        const Icon(
          Icons.notifications,
          color: Colors.blue,
        ),

        const SizedBox(width: 12),

        Expanded(
          child: Text(
            message,
            style: const TextStyle(
              color: Colors.white,
            ),
          ),
        ),
      ],
    ),
  );
}



  Widget _buildWaitTimeCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: const Column(
        children: [
          Text(
            "Estimated Wait Time",
            style: TextStyle(
              color: Colors.white54,
            ),
          ),
          SizedBox(height: 10),
          Text(
            "30 mins",
            style: TextStyle(
              color: Colors.white,
              fontSize: 34,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}