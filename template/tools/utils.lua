import("core.project.config")
import("lib.detect.find_file")
import("lib.detect.find_tool")

function get_vc_include_path(arch)
    local vswhere = find_tool("vswhere")
    if not vswhere then
        raise("vswhere not found. Please install Visual Studio 2019 or later.")
    end

    local vs_info = os.iorunv(vswhere.program, {
        "-latest", 
        "-products", "Microsoft.VisualStudio.Product.BuildTools", 
        "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", 
        "-property", "installationPath"
    })

    vs_info = vs_info:trim()
    if not vs_info or vs_info == "" then
        raise("vswhere not found. Please install Visual Studio 2019 or later.")
    end

    local vcvarsall = find_file("vcvarsall.bat", path.join(vs_info, "VC", "Auxiliary", "Build"))
    if not vcvarsall then
        raise("vcvarsall.bat not found. Please install Visual Studio 2019 or later.")
    end

    local temp_bat = os.tmpfile() .. "_extract_include.bat"
    local temp_out = os.tmpfile() .. "_vcvars_output.txt"
    local file = io.open(temp_bat, "w")
    if file then
        -- Generate batch commands to extract the INCLUDE path
        file:print("@echo off")
        file:print("call \"%s\" %s > nul", vcvarsall, arch or "x64")
        file:print("echo INCLUDE=%%INCLUDE%% > \"%s\"", temp_out)
        file:close()
    end

    os.exec(temp_bat)

    local include_path = io.readfile(temp_out):match("INCLUDE=(.*)")
    if not include_path or include_path == "" then
        raise("Include path not found. Please install Visual Studio 2019 or later.")
    end

    return include_path:trim()
end