# Keep Retrofit service interfaces and their annotations.
-keepattributes Signature, RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations, AnnotationDefault
-keep class retrofit2.** { *; }
-keep interface retrofit2.** { *; }
-dontwarn retrofit2.**

# Keep Gson model fields used by reflection.
-keep class com.aether.driver.data.model.** { *; }
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**
