import SwiftUI

struct SettingsView: View {
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("darkMode") private var darkMode = false
    @State private var showDeleteAlert = false
    @State private var showSavedToast = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Account Settings")) {
                    NavigationLink("Edit Profile") {
                        EditProfileView()
                    }
                    NavigationLink("Change Password") {
                        ChangePasswordView()
                    }
                }

                Section(header: Text("Notifications")) {
                    Toggle("Email notifications", isOn: $notificationsEnabled)
                    Toggle("Push notifications", isOn: .constant(true))
                }

                Section(header: Text("Danger Zone")) {
                    Button("Delete Account") {
                        showDeleteAlert = true
                    }
                    .foregroundColor(.red)
                }

                Section {
                    Button("Save") {
                        showSavedToast = true
                    }
                    Button("Cancel") {
                        // dismiss
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Are you sure?", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {}
            } message: {
                Text("Once you delete your account, there is no going back.")
            }
            .overlay {
                if showSavedToast {
                    Text("Changes saved successfully!")
                        .padding()
                        .background(.green.opacity(0.9))
                        .cornerRadius(8)
                }
            }
        }
    }
}
