-- Set the Adobe After Effects SDK path
local AE_SDK_PATH = "../../"

-- Project configuration
set_project("Skeleton")
set_languages("c++11")

-- Specify the target
target("Skeleton")
    set_kind("shared")

    -- Source files
    add_files(path.join(AE_SDK_PATH, "Util/*.cpp"))
    add_files("Skeleton_Strings.cpp", "Skeleton.cpp")

    -- Include directories
    add_includedirs(
        path.join(AE_SDK_PATH, "Headers"),
        path.join(AE_SDK_PATH, "Headers/SP"),
        path.join(AE_SDK_PATH, "Util"),
        path.join(AE_SDK_PATH, "Resources"),
        "."
    )

    -- macOS specific configurations
    if is_plat("macosx") then
        set_values("xcode.codesign.identity", "Developer ID")
        set_values("xcode.bundle.id", "com.adobe.AfterEffects." .. project.name())
        set_values("xcode.bundle.info.plist", {
            ["CFBundleIdentifier"] = "com.adobe.AfterEffects." .. project.name(),
            ["CFBundleName"] = project.name(),
            ["CFBundleVersion"] = "1.0.0",
            ["CFBundleExecutable"] = project.name(),
            ["CFBundleShortVersionString"] = "1.0"
        })

        set_targetdir("$(buildir)/$(plat)/$(arch)/")
        add_defines("__MACH__")
        add_macos_links("Cocoa")
        set_archs("arm64", "x86_64")

        -- Add custom command for PiPL
        after_build(function (target)
            os.execv("/Developer/Tools/rez", {
                path.join(os.projectdir(), "SkeletonPiPL.r"),
                "-o", path.join(target:targetdir(), "SkeletonPiPL.rsrc"),
                "-useDF",
                "-i", path.join(AE_SDK_PATH, "Headers"),
                "-i", path.join(AE_SDK_PATH, "Headers/SP"),
                "-i", path.join(AE_SDK_PATH, "Util"),
                "-i", path.join(AE_SDK_PATH, "Resources"),
                "-D __MACH__"
            })
        end)

        add_files("$(buildir)/macosx/$(arch)/SkeletonPiPL.rsrc", {macosx_bundle = true})
        set_suffix("")
    end

    -- Windows specific configurations
    if is_plat("windows") then
        add_defines("_CRT_SECURE_NO_WARNINGS")
        set_suffix(".aex")

        -- Add custom commands for PiPL on Windows
        after_build(function (target)
            os.exec("cl /I ..\\%s\\Headers /I ..\\%s\\Headers\\SP /I ..\\%s\\Util /I ..\\%s\\Resources /EP %s > %s.rr",
                AE_SDK_PATH, AE_SDK_PATH, AE_SDK_PATH, AE_SDK_PATH, 
                path.join(os.projectdir(), "SkeletonPiPL.r"),
                path.join(target:targetdir(), project.name())
            )
            os.exec("%s %s.rr %s.rrc", path.join(AE_SDK_PATH, "Resources/PiPLtool.exe"), target:targetdir(), target:targetdir())
            os.exec("cl /D MSWindows /EP %s.rrc > %s.rc", target:targetdir(), target:targetdir())
        end)

        add_files(path.join("$(buildir)", "windows", "$(arch)", project.name() .. ".rc"))
    end
