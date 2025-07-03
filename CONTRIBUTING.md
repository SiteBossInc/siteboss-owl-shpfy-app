# Contributing to SiteBoss OWL Shopify Integration App

Thank you for your interest in contributing to the SiteBoss OWL Shopify Integration App! We welcome contributions from the community and are grateful for your support.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Screenshots or error messages if applicable

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/siteboss-owl-shpfy-app.git
   cd siteboss-owl-shpfy-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your development credentials
   ```

5. **Initialize the database**:
   ```bash
   npm run setup
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Run tests** to ensure everything works:
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add new feature description"
   ```

### Submitting Changes

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of your changes
   - Include screenshots for UI changes

## 📋 Coding Standards

### Code Style

- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **TypeScript**: Use TypeScript for type safety where applicable

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Testing

- **Write tests** for new features and bug fixes
- **Ensure all tests pass** before submitting
- **Maintain test coverage** above 80%

## 🏗️ Project Structure

```
siteboss-owl-shpfy-app/
├── app/
│   ├── routes/          # Remix routes
│   ├── services/        # Business logic
│   └── shopify.server.js # Shopify configuration
├── docs/                # Documentation
├── prisma/              # Database schema
└── tests/               # Test files
```

## 🚀 Release Process

1. **Version Bumping**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Testing**: Ensure all tests pass and manual testing is complete
4. **Tagging**: Create a git tag for the release
5. **Documentation**: Update README and other docs as needed

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check the [docs/](./docs/) directory

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in our README and release notes. Thank you for helping make this project better!
