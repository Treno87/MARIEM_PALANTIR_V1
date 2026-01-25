# frozen_string_literal: true

require "roo"

module ExcelImport
  class BaseImporter
    Result = Struct.new(:success?, :processed, :created, :skipped, :failed, :errors, :error, keyword_init: true)

    attr_reader :file_path, :store

    def initialize(file_path, store:)
      @file_path = file_path
      @store = store
      @processed = 0
      @created = 0
      @skipped = 0
      @failed = 0
      @errors = []
    end

    def call
      return file_not_found_result unless File.exist?(file_path)

      process_rows
      success_result
    rescue StandardError => e
      failure_result(e.message)
    end

    def sheet
      @sheet ||= workbook.sheet("data")
    end

    protected

    def process_rows
      # Override in subclasses
    end

    def increment_processed
      @processed += 1
    end

    def increment_created
      @created += 1
    end

    def increment_skipped
      @skipped += 1
    end

    def increment_failed
      @failed += 1
    end

    def add_error(message)
      @errors << message
    end

    def data_rows
      @data_rows ||= sheet.drop(1).to_a
    end

    def parse_date(value)
      return Time.current if value.blank?

      case value
      when Date, DateTime, Time
        value.to_time
      when Numeric
        DateTime.new(1899, 12, 30) + value.days
      else
        Time.zone.parse(value.to_s) rescue Time.current
      end
    end

    def extract_count_from_name(name)
      match = name.to_s.match(/(\d+)\s*회/)
      match ? match[1].to_i : 1
    end

    private

    def workbook
      @workbook ||= Roo::Spreadsheet.open(file_path)
    end

    def file_not_found_result
      Result.new(
        success?: false,
        error: "File not found: #{file_path}"
      )
    end

    def success_result
      Result.new(
        success?: true,
        processed: @processed,
        created: @created,
        skipped: @skipped,
        failed: @failed,
        errors: @errors
      )
    end

    def failure_result(message)
      Result.new(
        success?: false,
        error: message,
        processed: @processed,
        created: @created,
        skipped: @skipped,
        failed: @failed,
        errors: @errors
      )
    end
  end
end
