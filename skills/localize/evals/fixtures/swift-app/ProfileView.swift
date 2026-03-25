import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Personal Information")) {
                    HStack {
                        Text("Full Name")
                        Spacer()
                        Text(viewModel.fullName)
                            .foregroundColor(.secondary)
                    }
                    HStack {
                        Text("Email")
                        Spacer()
                        Text(viewModel.email)
                            .foregroundColor(.secondary)
                    }
                }

                Section(header: Text("Preferences")) {
                    Toggle("Enable Notifications", isOn: $viewModel.notificationsEnabled)
                    Toggle("Dark Mode", isOn: $viewModel.darkModeEnabled)
                    Picker("Language", selection: $viewModel.selectedLanguage) {
                        ForEach(viewModel.availableLanguages, id: \.self) { lang in
                            Text(lang)
                        }
                    }
                }

                Section {
                    Button("Save Changes") {
                        viewModel.save()
                    }
                    .frame(maxWidth: .infinity)

                    Button("Delete Account") {
                        viewModel.showDeleteConfirmation = true
                    }
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Profile")
            .alert("Are you sure?", isPresented: $viewModel.showDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    viewModel.deleteAccount()
                }
            } message: {
                Text("This action cannot be undone. All your data will be permanently deleted.")
            }
        }
    }
}
