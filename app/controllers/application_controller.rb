# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pagy::Backend

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  before_action :authenticate_user!
  before_action :set_current_store

  helper_method :current_store

  private

  def current_store
    @current_store ||= current_user&.store
  end

  def set_current_store
    @store = current_store
  end
end
