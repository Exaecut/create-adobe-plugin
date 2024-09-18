#include "core/public/plugin_strings.h"

typedef struct {
	A_u_long	index;
	A_char		str[256];
} TableString;

TableString		g_strs[StrID_NUMTYPES] = {
	StrID_NONE,						"",
	StrID_Name,						"Skeleton",
	StrID_Description,				"An empty (skeletal, if you will) effect sample,\r for your modifying pleasure.\rCopyright 2007-2023 Adobe Inc.",
	StrID_Gain_Param_Name,			"Gain",
	StrID_Color_Param_Name,			"Color",
};

char	*GetStringPtr(int strNum)
{
	return g_strs[strNum].str;
}