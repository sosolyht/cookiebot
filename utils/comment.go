// utils\comment.go

package utils

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// AddComments 함수로 분리
func AddComments() error {
	err := filepath.Walk(".", addComments)
	if err != nil {
		return fmt.Errorf("Error walking the path: %v", err)
	}
	return nil
}

func addComments(path string, info fs.FileInfo, err error) error {
	if err != nil {
		return err
	}

	if info.IsDir() {
		// Skip node_modules and dist directories
		if info.Name() == "node_modules" || info.Name() == "dist" || info.Name() == "build" || info.Name() == "wailjs" {
			return filepath.SkipDir
		}
		return nil
	}

	ext := filepath.Ext(path)
	if ext == ".go" || ext == ".css" || ext == ".tsx" {
		// Read the file content
		content, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		lines := strings.Split(string(content), "\n")

		// Check if the first line is already a comment
		if len(lines) > 0 {
			if (ext == ".go" || ext == ".tsx") && strings.HasPrefix(lines[0], "//") {
				return nil // Skip adding comment if already present
			} else if ext == ".css" && strings.HasPrefix(lines[0], "/*") && strings.HasSuffix(lines[0], "*/") {
				return nil // Skip adding comment if already present
			}
		}

		// Create the comment line with forward slashes
		normalizedPath := filepath.ToSlash(path)
		var comment string
		if ext == ".go" || ext == ".tsx" {
			comment = fmt.Sprintf("// %s", normalizedPath)
		} else if ext == ".css" {
			comment = fmt.Sprintf("/* %s */", normalizedPath)
		}

		// Prepend the comment to the file content
		lines = append([]string{comment, ""}, lines...)
		newContent := strings.Join(lines, "\n")

		// Write the new content back to the file
		err = os.WriteFile(path, []byte(newContent), info.Mode())
		if err != nil {
			return err
		}

		fmt.Printf("Added comment to %s\n", normalizedPath)
	}

	return nil
}
