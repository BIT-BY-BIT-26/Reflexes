String formatReviewTime(DateTime date) {

 final diff =
     DateTime.now().difference(date);

 if(diff.inDays>0){
   return "${diff.inDays} days ago";
 }

 if(diff.inHours>0){
   return "${diff.inHours} hours ago";
 }

 if(diff.inMinutes>0){
   return "${diff.inMinutes} mins ago";
 }

 return "Just now";
}