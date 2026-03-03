#[tauri::command]
pub async fn list_passwords() -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("list")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_password(
    title: String,
    username: String,
    password: String,
    website: Option<String>,
    notes: Option<String>,
    category: Option<String>
) -> Result<String, String> {
    // 调用 pm 命令
    let mut cmd = std::process::Command::new("pm");
    cmd.arg("add");
    cmd.arg(&title);
    cmd.arg(&username);
    cmd.arg(&password);

    if let Some(website) = website {
        cmd.arg("--website");
        cmd.arg(&website);
    }

    if let Some(notes) = notes {
        cmd.arg("--notes");
        cmd.arg(&notes);
    }

    if let Some(category) = category {
        cmd.arg("--category");
        cmd.arg(&category);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_password(
    id: String,
    title: String,
    username: String,
    password: String,
    website: Option<String>,
    notes: Option<String>,
    category: Option<String>
) -> Result<String, String> {
    // 调用 pm 命令
    let mut cmd = std::process::Command::new("pm");
    cmd.arg("update");
    cmd.arg(&id);
    cmd.arg(&title);
    cmd.arg(&username);
    cmd.arg(&password);

    if let Some(website) = website {
        cmd.arg("--website");
        cmd.arg(&website);
    }

    if let Some(notes) = notes {
        cmd.arg("--notes");
        cmd.arg(&notes);
    }

    if let Some(category) = category {
        cmd.arg("--category");
        cmd.arg(&category);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_password(id: String) -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("delete")
        .arg(&id)
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_password(
    length: usize,
    uppercase: bool,
    lowercase: bool,
    numbers: bool,
    symbols: bool
) -> Result<String, String> {
    // 调用 pm 命令
    let mut cmd = std::process::Command::new("pm");
    cmd.arg("generate");
    cmd.arg("--length");
    cmd.arg(length.to_string());

    if uppercase {
        cmd.arg("--uppercase");
    }
    if lowercase {
        cmd.arg("--lowercase");
    }
    if numbers {
        cmd.arg("--numbers");
    }
    if symbols {
        cmd.arg("--symbols");
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_passwords(path: String) -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("export")
        .arg(&path)
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn import_passwords(path: String) -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("import")
        .arg(&path)
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn init_database() -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("init")
        .arg("--force")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cleanup_database() -> Result<String, String> {
    // 调用 pm 命令
    std::process::Command::new("pm")
        .arg("cleanup")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}
