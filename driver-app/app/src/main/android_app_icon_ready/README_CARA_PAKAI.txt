CARA PAKAI ICON ANDROID

1. Extract ZIP ini.
2. Copy folder 'res' ke:
   app/src/main/res

   Jika diminta replace/overwrite, pilih replace.

3. Pastikan AndroidManifest.xml memakai icon ini:

   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round"
       ... >

Isi ZIP:
- res/mipmap-mdpi sampai xxxhdpi: icon launcher ukuran Android.
- res/mipmap-anydpi-v26: adaptive icon untuk Android 8+.
- res/values/ic_launcher_background.xml: background putih.
- playstore_icon_512.png: ukuran 512x512 untuk preview/upload.
- transparent_icon_512.png: versi transparan 512x512.
