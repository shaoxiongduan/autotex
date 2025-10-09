# Contributing to AutoTeX

Thank you for your interest in contributing to AutoTeX! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/autotex.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Visual Studio Code
- LM Studio (for testing)

### Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on save)
npm run watch
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Open a `.tex` file in the new window
4. Test your changes

## Project Structure

```
autotex/
├── src/
│   ├── extension.ts           # Main entry point, activation/deactivation
│   ├── inputMonitor.ts        # Monitors Enter key presses
│   ├── documentStateManager.ts # Tracks conversion regions
│   ├── lmStudioClient.ts      # LM Studio API integration
│   ├── textReplacer.ts        # Text replacement logic
│   └── autoSaveManager.ts     # Auto-save functionality
├── .vscode/                   # VS Code configuration
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # Documentation
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Follow ESLint rules (run `npm run lint`)
- Use 4 spaces for indentation
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Example

```typescript
/**
 * Convert rough draft text to LaTeX using LM Studio
 * @param roughDraftText The raw text to convert
 * @returns Formatted LaTeX code
 */
async convertToLatex(roughDraftText: string): Promise<string> {
    // Implementation
}
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test the following scenarios:

- [ ] Basic conversion (3x Enter triggers conversion)
- [ ] Conversion with concurrent editing (type elsewhere during conversion)
- [ ] Multiple consecutive conversions
- [ ] LM Studio disconnection handling
- [ ] Invalid/malformed rough draft text
- [ ] Very long rough draft sections
- [ ] Empty rough draft sections
- [ ] File with no formatted LaTeX (all rough draft)
- [ ] File with mixed formatted and rough sections

### Test Files

Use the included `example.tex` for basic testing. Create additional test files for edge cases.

## Adding Features

### New Feature Checklist

- [ ] Discuss feature in an issue first
- [ ] Implement the feature
- [ ] Add appropriate error handling
- [ ] Update configuration in `package.json` if needed
- [ ] Update README.md with usage instructions
- [ ] Update CHANGELOG.md
- [ ] Test thoroughly
- [ ] Submit PR with clear description

### Feature Ideas

See the Roadmap section in README.md for planned features:
- Custom system prompts via UI
- Multiple LLM backend support
- Visual indicators for rough draft regions
- Undo/redo for conversions
- Streaming responses

## Coding Guidelines

### Error Handling

Always provide helpful error messages:

```typescript
try {
    await doSomething();
} catch (error) {
    vscode.window.showErrorMessage(
        `Failed to do something: ${error instanceof Error ? error.message : String(error)}`
    );
}
```

### Async Operations

Use VS Code's progress API for long operations:

```typescript
await vscode.window.withProgress(
    {
        location: vscode.ProgressLocation.Notification,
        title: 'Processing...',
        cancellable: false,
    },
    async (progress) => {
        // Do work
    }
);
```

### Configuration

Access configuration consistently:

```typescript
const config = vscode.workspace.getConfiguration('autotex');
const value = config.get<string>('settingName', 'defaultValue');
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if user-facing changes
   - Update CHANGELOG.md with your changes
   - Add JSDoc comments to new functions

2. **Code Quality**
   - Run `npm run lint` and fix all issues
   - Ensure TypeScript compiles without errors
   - Test in Extension Development Host

3. **PR Description**
   - Clearly describe what changes were made
   - Reference any related issues
   - Include screenshots/videos for UI changes
   - List any breaking changes

4. **Review Process**
   - Respond to review comments
   - Make requested changes
   - Re-request review when ready

## Bug Reports

### Before Submitting

- Check if the issue already exists
- Try the latest version
- Test with a fresh configuration

### Include in Report

- AutoTeX version
- VS Code version
- Operating system
- LM Studio version and model
- Steps to reproduce
- Expected vs actual behavior
- Error messages from Output panel (View → Output → AutoTeX)
- Screenshots if applicable

## Feature Requests

### Good Feature Requests Include

- Clear description of the feature
- Use case / why it's needed
- Example of how it would work
- Any alternatives considered

## Architecture Decisions

### Why These Choices?

**TypeScript over JavaScript:**
- Type safety reduces bugs
- Better IDE support
- Easier to maintain

**VS Code Extension over Standalone:**
- Integrates with existing workflow
- Access to powerful APIs
- Large user base of LaTeX users already on VS Code

**LM Studio over Cloud APIs:**
- Privacy (notes stay local)
- No API costs
- Works offline
- Fast response times

**Axios over fetch:**
- Better error handling
- Timeout support
- Simpler API

### Adding Dependencies

- Minimize dependencies
- Prefer well-maintained packages
- Check license compatibility (MIT preferred)
- Document why the dependency is needed

## Communication

- **Issues:** For bugs and feature requests
- **Discussions:** For questions and general discussion
- **Pull Requests:** For code contributions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## Questions?

Feel free to:
- Open an issue with the "question" label
- Start a discussion
- Reach out to maintainers

Thank you for contributing to AutoTeX! 🎉

